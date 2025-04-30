import { Project, MenuItem, ScreenElement } from "@shared/schema";

/**
 * Calculate the current visible menu items based on selected index
 * This creates a circular scrolling effect with the selected item in the center
 */
export function getVisibleMenuItems(
  menuItems: MenuItem[],
  selectedIndex: number,
  maxVisibleItems: number = 3
): { item: MenuItem; index: number; highlighted: boolean; position: 'top' | 'middle' | 'bottom' | 'normal' }[] {
  if (!menuItems.length) return [];
  
  // For circular navigation with a fixed selection box in the middle
  const result = [];
  
  // When we have a stationary selection box, the selected item is always
  // in the middle position, and the other items are above and below it
  
  // Calculate starting index for visible items
  let startIdx = selectedIndex - 1; // One item before the selected item
  
  // Handle circular wrapping for the previous item
  if (startIdx < 0) {
    startIdx = menuItems.length - 1; // Wrap to the last item
  }
  
  // Add items to result in the order they should appear:
  // 1. The item above the selected item
  // 2. The selected item (in the middle)
  // 3. The item below the selected item
  
  for (let i = 0; i < maxVisibleItems; i++) {
    // Calculate actual index with circular wrapping
    let actualIndex = (startIdx + i) % menuItems.length;
    
    // Determine position for styling/visual cues
    let position: 'top' | 'middle' | 'bottom' | 'normal';
    if (i === 0) position = 'top';
    else if (i === 1) position = 'middle'; // Middle is always the selected item
    else position = 'bottom';
    
    result.push({
      item: menuItems[actualIndex],
      index: actualIndex,
      // The highlighted item is always at position 1 (the middle)
      highlighted: i === 1,
      position
    });
  }
  
  return result;
}

// For text scrolling animation in the menu
let scrollOffset = 0;
let scrollAnimationFrame: number | null = null;
let lastScrollTime = 0;
const SCROLL_SPEED = 2; // pixels per frame - increased for better visibility
let scrollDirection: 'rtl' | 'ltr' = 'rtl'; // default right-to-left
let animationActive = true; // flag to control animation
let pauseBeforeScroll = 1000; // pause before starting to scroll (ms)
let lastDirectionChange = 0; // track when direction was last changed

// Change text scroll direction
export function setScrollDirection(direction: 'rtl' | 'ltr'): void {
  if (scrollDirection !== direction) {
    scrollDirection = direction;
    // Reset scroll offset when direction changes
    scrollOffset = 0;
    lastScrollTime = performance.now();
    lastDirectionChange = performance.now();
    animationActive = true; // Ensure animation is active
    
    // Cancel any existing animation frame
    if (scrollAnimationFrame) {
      cancelAnimationFrame(scrollAnimationFrame);
      scrollAnimationFrame = null;
    }
  }
}

/**
 * Render menu to canvas - making it look like a real OLED display
 */
export function renderMenuToCanvas(
  ctx: CanvasRenderingContext2D,
  menuItems: MenuItem[],
  selectedIndex: number,
  width: number,
  height: number,
  timestamp = performance.now()
): void {
  // Clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  
  // Simulate OLED display by adding a subtle pixel pattern
  ctx.globalAlpha = 0.05;
  for (let x = 0; x < width; x += 2) {
    for (let y = 0; y < height; y += 2) {
      if (Math.random() > 0.97) {
        ctx.fillStyle = "#333";
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  ctx.globalAlpha = 1.0;
  
  // If no menu items, show empty state
  if (!menuItems.length) {
    ctx.fillStyle = "white";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("No Menu Items", width / 2, height / 2);
    ctx.textAlign = "left";
    return;
  }
  
  // Get visible menu items (3 at a time)
  const visibleItems = getVisibleMenuItems(menuItems, selectedIndex);
  
  // Make menu items taller to use the full display height
  const itemHeight = Math.floor(height / 3); // Exactly 3 items per screen
  const startY = 0; // Start at the top of the display
  
  // Draw scrollbar indicator on the right if there are more than visible items
  if (menuItems.length > 3) {
    // Draw scrollbar track
    ctx.fillStyle = "#333333";
    ctx.fillRect(width - 4, 4, 2, height - 8);
    
    // Calculate scrollbar thumb position
    const scrollTrackHeight = height - 8;
    const thumbHeight = Math.max(8, scrollTrackHeight * (3 / menuItems.length));
    const thumbY = 4 + (selectedIndex / (menuItems.length - 1)) * (scrollTrackHeight - thumbHeight);
    
    // Draw scrollbar thumb
    ctx.fillStyle = "white";
    ctx.fillRect(width - 4, thumbY, 2, thumbHeight);
  }
  
  // Check if we need to animate text scrolling
  const highlightedItem = visibleItems.find(item => item.highlighted);
  const maxTextWidth = width - 50; // Available width for text inside selection box

  // Animate scrolling for the highlighted text if it's too wide
  if (highlightedItem) {
    ctx.font = "bold 11px monospace"; // Need to set font before measuring text
    const textWidth = ctx.measureText(highlightedItem.item.label).width;
    
    if (textWidth > maxTextWidth) {
      // Calculate time-based scrolling with pauses
      const elapsed = timestamp - lastScrollTime;
      const timeSinceDirectionChange = timestamp - lastDirectionChange;
      
      // Add initial pause before scrolling starts
      if (timeSinceDirectionChange < pauseBeforeScroll) {
        // Keep text in starting position during pause
        scrollOffset = (scrollDirection === 'rtl') ? 0 : 0;
      } 
      // Then start the scrolling
      else if (elapsed > 40) { // Smoother update at 40ms intervals
        // Update scroll position based on direction
        if (scrollDirection === 'rtl') {
          // Right to left scrolling (text moves right to left)
          scrollOffset += SCROLL_SPEED;
          // Reset scrolling position when it has scrolled past the text + some padding
          if (scrollOffset > textWidth + 40) {
            // Pause for a moment at the end
            scrollOffset = -maxTextWidth;
            lastDirectionChange = timestamp; // Reset the pause timer
          }
        } else {
          // Left to right scrolling (text moves left to right)
          scrollOffset -= SCROLL_SPEED;
          // Reset scrolling position when it has scrolled past the screen
          if (scrollOffset < -textWidth - 40) {
            scrollOffset = maxTextWidth;
            lastDirectionChange = timestamp; // Reset the pause timer
          }
        }
        lastScrollTime = timestamp;
      }
      
      // Request next animation frame
      if (scrollAnimationFrame) {
        cancelAnimationFrame(scrollAnimationFrame);
      }
      scrollAnimationFrame = requestAnimationFrame(() => {
        renderMenuToCanvas(ctx, menuItems, selectedIndex, width, height);
      });
    } else {
      // Reset scroll for shorter texts
      scrollOffset = 0;
    }
  }
  
  // Draw "UP/DN" indicator at bottom of scrollbar
  if (menuItems.length > 3) {
    ctx.fillStyle = "white";
    ctx.font = "6px monospace";
    ctx.fillText("UP/DN", width - 16, height - 4);
  }
  
  // Render each visible menu item
  visibleItems.forEach((item, idx) => {
    const y = startY + (idx * itemHeight) + Math.floor(itemHeight / 2) + 6; // Adjust for vertical centering
    
    // Create icon placeholder (like in reference image)
    let iconChar = "";
    
    // Get icon from the menu item's iconPath if it exists and is a predefined icon
    if (item.item.iconPath && item.item.iconPath.startsWith("icon:")) {
      const iconId = item.item.iconPath.split(":")[1];
      switch (iconId) {
        case "knob":
          iconChar = "⊕"; // Knob icon
          break;
        case "sensor":
          iconChar = "≡"; // Sensor/signal icon
          break;
        case "gauge":
          iconChar = "⊗"; // Gauge icon
          break;
        case "settings":
          iconChar = "⊙"; // Settings icon
          break;
        default:
          iconChar = "⊛"; // Custom/generic icon
          break;
      }
    } 
    // If no icon or using a custom uploaded icon, determine icon by label content
    else if (!item.item.iconPath) {
      if (item.item.label.toLowerCase().includes("knob")) {
        iconChar = "⊕"; // Knob icon
      } else if (item.item.label.toLowerCase().includes("sensor")) {
        iconChar = "≡"; // Sensor/signal icon
      } else if (item.item.label.toLowerCase().includes("gauge") || item.item.label.toLowerCase().includes("turbo")) {
        iconChar = "⊗"; // Gauge icon
      } else if (item.item.label.toLowerCase().includes("settings") || item.item.label.toLowerCase().includes("config")) {
        iconChar = "⊙"; // Settings icon
      } else {
        // Default icon based on index
        const iconChars = ["⊕", "≡", "⊗", "⊙", "⊛"];
        iconChar = iconChars[item.index % iconChars.length];
      }
    }
    // For custom uploaded icons, use a generic icon character
    else {
      iconChar = "⊛"; // Custom/generic icon
    }
    
    // Draw a fixed, stationary selection box in the middle position
    if (idx === 1) { // Always draw around the middle position (idx=1 for 3 items)
      // Calculate position for the stationary selection box
      // The middle position is exactly 1/3 of the way down from the top
      const boxY = Math.floor(height / 3); // Start at 1/3 of the screen height
      const boxHeight = Math.floor(height / 3); // Height is 1/3 of the screen
      
      // Draw square brackets around the middle item - "[Park Sensor]"
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      // Left bracket "["
      ctx.moveTo(6, boxY);
      ctx.lineTo(18, boxY); // Top horizontal line
      ctx.moveTo(6, boxY);
      ctx.lineTo(6, boxY + boxHeight); // Vertical line
      ctx.moveTo(6, boxY + boxHeight);
      ctx.lineTo(18, boxY + boxHeight); // Bottom horizontal line
      
      // Right bracket "]"
      ctx.moveTo(width - 6, boxY);
      ctx.lineTo(width - 18, boxY); // Top horizontal line
      ctx.moveTo(width - 6, boxY);
      ctx.lineTo(width - 6, boxY + boxHeight); // Vertical line
      ctx.moveTo(width - 6, boxY + boxHeight);
      ctx.lineTo(width - 18, boxY + boxHeight); // Bottom horizontal line
      
      ctx.stroke();
    }
    
    // Render the menu item text and icon
    if (item.highlighted) {
      // Use white text for highlighted item
      ctx.fillStyle = "white";
      ctx.font = "bold 11px monospace";
      
      // Draw icon (larger size)
      ctx.font = "bold 19px monospace"; // Bigger font for icons
      ctx.fillText(iconChar, 20, y);
      ctx.font = "bold 11px monospace"; // Reset font size for text
      
      // Draw the text with adjusted positioning
      const label = item.item.label;
      const textWidth = ctx.measureText(label).width;
      const availableWidth = width - 50;
      
      if (textWidth > availableWidth) {
        // If text is too wide, apply scrolling based on direction
        ctx.fillText(label, 36 - scrollOffset, y);
        
        // Draw text again for continuous scrolling effect
        if (scrollDirection === 'rtl' && scrollOffset > 0) {
          // For right-to-left scrolling
          ctx.fillText(label, 36 - scrollOffset + textWidth + 20, y);
        } else if (scrollDirection === 'ltr' && scrollOffset < 0) {
          // For left-to-right scrolling
          ctx.fillText(label, 36 - scrollOffset - textWidth - 20, y);
        }
      } else {
        // Normal text rendering for shorter texts
        ctx.fillText(label, 36, y);
      }
    } else {
      // Non-highlighted items
      ctx.fillStyle = "white";
      ctx.font = "11px monospace";
      
      // Draw icon (larger size)
      ctx.font = "19px monospace"; // Bigger font for icons
      ctx.fillText(iconChar, 20, y);
      ctx.font = "11px monospace"; // Reset font size for text
      
      // Draw the text
      const label = item.item.label;
      const textWidth = ctx.measureText(label).width;
      const availableWidth = width - 50;
      
      if (textWidth > availableWidth) {
        // Truncate text and add ellipsis for long non-highlighted items
        let truncatedText = label;
        let ellipsis = "...";
        
        while (ctx.measureText(truncatedText + ellipsis).width > availableWidth && truncatedText.length > 0) {
          truncatedText = truncatedText.slice(0, -1);
        }
        
        ctx.fillText(truncatedText + ellipsis, 36, y);
      } else {
        // Normal text rendering
        ctx.fillText(label, 36, y);
      }
    }
  });
}

/**
 * Render a screen (with screen elements) to canvas
 */
export function renderScreenToCanvas(
  ctx: CanvasRenderingContext2D, 
  screenElements: ScreenElement[],
  width: number,
  height: number
): void {
  // Clear canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, width, height);
  
  // If no screen elements, show empty state
  if (!screenElements.length) {
    ctx.fillStyle = "white";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Empty Screen", width / 2, height / 2);
    return;
  }
  
  // Render each screen element
  screenElements.forEach(element => {
    if (element.type === "text") {
      ctx.fillStyle = "white";
      ctx.font = "10px monospace"; // Using monospace for all fonts in preview
      ctx.textAlign = "left";
      ctx.fillText(element.text, element.x, element.y);
      
      // For elements with data types, add a placeholder value
      if (element.dataType) {
        let placeholder = '';
        switch (element.dataType) {
          case "int":
            placeholder = "123";
            break;
          case "float":
            placeholder = "12.34";
            break;
          case "string":
            placeholder = "Value";
            break;
        }
        
        // Calculate offset based on text length
        const textWidth = ctx.measureText(element.text).width;
        ctx.fillStyle = "#00ff00"; // Green color for values
        ctx.fillText(placeholder, element.x + textWidth + 5, element.y);
      }
    }
  });
}

// Export the Project data to JSON format
export function exportProjectToJson(project: Project): string {
  return JSON.stringify(project, null, 2);
}
