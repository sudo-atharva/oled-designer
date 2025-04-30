import { Project, MenuItem, ScreenElement, DataType } from "@shared/schema";

/**
 * Generate C header file for the project
 */
export function generateHeader(project: Project): string {
  const guardName = `${project.name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_H`;
  
  return `/**
 * ${project.name} - OLED Menu Library
 * 
 * Auto-generated header file
 * Created with OLED Menu Builder by Atharva Tikle
 * https://github.com/sudo-atharva
 */

#ifndef ${guardName}
#define ${guardName}

#include <U8g2lib.h>

// Screen dimensions
#define SCREEN_WIDTH ${project.width}
#define SCREEN_HEIGHT ${project.height}

// Menu item indices
enum MenuIndex {
${project.menuItems.map((item, index) => `  MENU_${item.label.toUpperCase().replace(/[^a-zA-Z0-9]/g, '_')} = ${index}`).join(',\n')}
};

// Total number of menu items
#define MENU_ITEM_COUNT ${project.menuItems.length}

// Function declarations
void setupDisplay();
void drawMenu(uint8_t selectedIndex);
${project.menuItems.map(item => `void draw${item.label.replace(/[^a-zA-Z0-9]/g, '')}Screen();`).join('\n')}
void handleMenuNavigation();

#endif // ${guardName}`;
}

/**
 * Generate C implementation file for the project
 */
export function generateImplementation(project: Project): string {
  // Collect data variables from all screen elements
  const dataVariables = new Set<string>();
  project.menuItems.forEach(item => {
    item.screenElements.forEach(element => {
      if (element.dataType && element.dataVariable) {
        dataVariables.add(element.dataVariable);
      }
    });
  });
  
  // Convert variables to C declarations with appropriate types
  const variableDeclarations = Array.from(dataVariables).map(varName => {
    // Find the first occurrence of this variable to determine its type
    let dataType = "String";
    for (const item of project.menuItems) {
      for (const el of item.screenElements) {
        if (el.dataVariable === varName) {
          switch (el.dataType) {
            case DataType.INT:
              dataType = "int";
              break;
            case DataType.FLOAT:
              dataType = "float";
              break;
            case DataType.STRING:
              dataType = "String";
              break;
          }
          break;
        }
      }
    }
    return `${dataType} ${varName} = ${getDefaultValueByType(dataType)};`;
  }).join('\n');
  
  return `/**
 * ${project.name} - OLED Menu Library Implementation
 * Created with OLED Menu Builder by Atharva Tikle
 * https://github.com/sudo-atharva
 */

#include "${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.h"

// Initialize the U8G2 library for your display
// Example for SSD1306 128x64 display with I2C:
U8G2_SSD1306_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

// Current selected menu index
uint8_t currentMenuIndex = 0;

// Data variables for dynamic content
${variableDeclarations}

/**
 * Setup the OLED display
 */
void setupDisplay() {
  u8g2.begin();
  u8g2.setFont(u8g2_font_6x10_tf); // Default font
  u8g2.setDrawColor(1);
  u8g2.setFontPosTop();
}

/**
 * Draw the menu with highlighted selection
 */
void drawMenu(uint8_t selectedIndex) {
  u8g2.clearBuffer();
  
  // Menu items
  const char* menuItems[MENU_ITEM_COUNT] = {
${project.menuItems.map(item => `    "${item.label}"`).join(',\n')}
  };
  
  // Calculate visible items (3 items at a time, scrolling)
  uint8_t visibleStart = 0;
  if (selectedIndex > 0) {
    visibleStart = selectedIndex - 1;
  }
  if (visibleStart > MENU_ITEM_COUNT - 3 && MENU_ITEM_COUNT > 2) {
    visibleStart = MENU_ITEM_COUNT - 3;
  }
  
  // Draw visible menu items
  for (uint8_t i = 0; i < 3 && i + visibleStart < MENU_ITEM_COUNT; i++) {
    uint8_t y = 20 + i * 16;
    
    if (i + visibleStart == selectedIndex) {
      // Draw selection box
      u8g2.drawFrame(10, y - 2, SCREEN_WIDTH - 20, 16);
    } else {
      // Draw '>' indicator for non-selected items
      u8g2.drawStr(12, y, ">");
    }
    
    // Draw menu item text
    u8g2.drawStr(24, y, menuItems[i + visibleStart]);
  }
  
  u8g2.sendBuffer();
}

${generateScreenDrawFunctions(project)}

/**
 * Handle navigation buttons
 */
void handleMenuNavigation() {
  // Example code for handling button inputs - adjust for your hardware
  // This is a placeholder for your actual button handling code
  
  // Check up button
  if (/* up button pressed */) {
    if (currentMenuIndex > 0) {
      currentMenuIndex--;
      drawMenu(currentMenuIndex);
    }
  }
  
  // Check down button
  if (/* down button pressed */) {
    if (currentMenuIndex < MENU_ITEM_COUNT - 1) {
      currentMenuIndex++;
      drawMenu(currentMenuIndex);
    }
  }
  
  // Check select button
  if (/* select button pressed */) {
    // Switch to appropriate screen based on menu index
    switch (currentMenuIndex) {
${project.menuItems.map((item, index) => `      case ${index}:
        draw${item.label.replace(/[^a-zA-Z0-9]/g, '')}Screen();
        break;`).join('\n')}
    }
  }
  
  // Check back button
  if (/* back button pressed */) {
    drawMenu(currentMenuIndex);
  }
}`;
}

/**
 * Generate screen drawing functions for each menu item
 */
function generateScreenDrawFunctions(project: Project): string {
  return project.menuItems.map(item => {
    return `/**
 * Draw the ${item.label} screen
 * Generated by OLED Menu Builder by Atharva Tikle
 */
void draw${item.label.replace(/[^a-zA-Z0-9]/g, '')}Screen() {
  u8g2.clearBuffer();
  
  // Set appropriate font
  u8g2.setFont(u8g2_font_6x10_tf);
  
${generateScreenElementDrawing(item.screenElements)}
  
  u8g2.sendBuffer();
}`;
  }).join('\n\n');
}

/**
 * Generate the code for drawing screen elements
 */
function generateScreenElementDrawing(elements: ScreenElement[]): string {
  if (elements.length === 0) {
    return '  // No screen elements';
  }
  
  return elements.map(element => {
    if (element.type === "text") {
      // For static text
      if (!element.dataType) {
        return `  // Draw "${element.text}" text
  u8g2.drawStr(${element.x}, ${element.y}, "${element.text}");`;
      } 
      // For text with data variable
      else {
        const dataVariable = element.dataVariable || 'value';
        return `  // Draw "${element.text}" with ${element.dataType} value
  u8g2.drawStr(${element.x}, ${element.y}, "${element.text}");
  
  // Draw the ${element.dataType} value
  char valueBuffer[20];
${formatValueBasedOnType(element.dataType, dataVariable, '  ')}
  u8g2.drawStr(${element.x + 60}, ${element.y}, valueBuffer);`;
      }
    }
    return '';
  }).join('\n\n');
}

/**
 * Generate code to format a value based on its type
 */
function formatValueBasedOnType(dataType: string, varName: string, indent: string): string {
  switch (dataType) {
    case DataType.INT:
      return `${indent}sprintf(valueBuffer, "%d", ${varName});`;
    case DataType.FLOAT:
      return `${indent}dtostrf(${varName}, 6, 2, valueBuffer);`;
    case DataType.STRING:
      return `${indent}sprintf(valueBuffer, "%s", ${varName}.c_str());`;
    default:
      return `${indent}sprintf(valueBuffer, "");`;
  }
}

/**
 * Get default value based on data type
 */
function getDefaultValueByType(dataType: string): string {
  switch (dataType) {
    case "int":
      return "0";
    case "float":
      return "0.0";
    case "String":
      return "\"\"";
    default:
      return "0";
  }
}

/**
 * Generate Arduino sketch with the menu implementation
 */
export function generateArduinoSketch(project: Project): string {
  return `/*
 * ${project.name} - OLED Menu System
 * Generated by OLED Menu Builder by Atharva Tikle
 * https://github.com/sudo-atharva
 */

#include <Arduino.h>
#include <U8g2lib.h>
#include <Wire.h>

${generateHeader(project).replace('#ifndef', '// Header File Content:\n//#ifndef')}

${generateImplementation(project).replace(`#include "${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.h"`, '// Implementation:')}

// Button pins - adjust for your hardware
#define BTN_UP    5
#define BTN_DOWN  6
#define BTN_SELECT 7
#define BTN_BACK   8

void setup() {
  Serial.begin(115200);
  
  // Initialize buttons
  pinMode(BTN_UP, INPUT_PULLUP);
  pinMode(BTN_DOWN, INPUT_PULLUP);
  pinMode(BTN_SELECT, INPUT_PULLUP);
  pinMode(BTN_BACK, INPUT_PULLUP);
  
  // Initialize display
  setupDisplay();
  
  // Draw initial menu
  drawMenu(currentMenuIndex);
}

void loop() {
  // Replace the placeholder button code with actual button reading
  handleMenuNavigation();
  
  // Add your main application logic here
  delay(50); // Small delay to prevent button bounce
}`;
}
