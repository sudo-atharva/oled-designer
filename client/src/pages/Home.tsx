import { useState } from "react";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import MenuBuilder from "@/components/MenuBuilder";
import OLEDPreview from "@/components/OLEDPreview";
import ScreenEditor from "@/components/ScreenEditor";
import CodeExporter from "@/components/CodeExporter";
import ProjectManager from "@/components/ProjectManager";
import { Project, MenuItem, projectSchema, OLEDDisplayType } from "@shared/schema";
import { setScrollDirection } from "@/lib/oled-utils";

// OLED display default configuration
const DEFAULT_WIDTH = 128;
const DEFAULT_HEIGHT = 64;

// Display type configurations
const DISPLAY_CONFIGS = {
  [OLEDDisplayType.SSD1306_128x64]: { width: 128, height: 64, name: "SSD1306 128x64" },
  [OLEDDisplayType.SSD1306_128x32]: { width: 128, height: 32, name: "SSD1306 128x32" },
  [OLEDDisplayType.SH1106_128x64]: { width: 128, height: 64, name: "SH1106 128x64" },
  [OLEDDisplayType.SSD1309_128x64]: { width: 128, height: 64, name: "SSD1309 128x64" }
};

// Create sample menu items for testing
const createSampleMenuItems = (): MenuItem[] => {
  return [
    {
      id: nanoid(),
      label: "Big Knob",
      iconPath: "icon:knob",
      font: "u8g2_font_6x12_tr",
      screenElements: []
    },
    {
      id: nanoid(),
      label: "Park Sensor",
      iconPath: "icon:sensor",
      font: "u8g2_font_6x12_tr",
      screenElements: []
    },
    {
      id: nanoid(),
      label: "Turbo Gauge",
      iconPath: "icon:gauge",
      font: "u8g2_font_6x12_tr",
      screenElements: []
    }
  ];
};

export default function Home() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("menu");
  const [textScrollDirection, setTextScrollDirection] = useState<'rtl' | 'ltr'>('rtl');
  
  // Initialize with sample menu items to demonstrate functionality
  const [project, setProject] = useState<Project>({
    id: nanoid(),
    name: "New Project",
    displayType: OLEDDisplayType.SSD1306_128x64,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    menuItems: createSampleMenuItems(),
    selectedIndex: 1 // Default to the middle item (Park Sensor)
  });
  
  // Initialize with no menu item selected to show the menu view
  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  
  // Handle scroll direction change
  const handleScrollDirectionChange = (checked: boolean) => {
    const direction = checked ? 'ltr' : 'rtl';
    setTextScrollDirection(direction);
    setScrollDirection(direction);
    toast({
      title: "Text Scroll Direction Changed",
      description: `Text will now scroll ${checked ? 'left to right' : 'right to left'}`
    });
  };
  
  // Handle display type change
  const handleDisplayTypeChange = (displayType: string) => {
    const config = DISPLAY_CONFIGS[displayType as keyof typeof DISPLAY_CONFIGS];
    setProject(prev => ({
      ...prev,
      displayType: displayType as any,
      width: config.width,
      height: config.height
    }));
    
    toast({
      title: "Display Type Updated",
      description: `Changed to ${config.name} (${config.width}x${config.height})`
    });
  };

  // Find the active menu item
  const activeMenuItem = selectedMenuItem 
    ? project.menuItems.find(item => item.id === selectedMenuItem) 
    : project.menuItems[0];

  // Create a new project
  const createNewProject = (name: string) => {
    const newProject: Project = {
      id: nanoid(),
      name,
      displayType: OLEDDisplayType.SSD1306_128x64,
      width: DEFAULT_WIDTH,
      height: DEFAULT_HEIGHT,
      menuItems: [],
      selectedIndex: 0
    };
    
    setProject(newProject);
    setSelectedMenuItem(null);
    toast({
      title: "New Project Created",
      description: `Started new project: ${name}`
    });
  };

  // Add a new menu item
  const addMenuItem = (menuItem: MenuItem) => {
    setProject(prev => {
      const newItems = [...prev.menuItems, menuItem];
      return { ...prev, menuItems: newItems };
    });
    
    setSelectedMenuItem(menuItem.id);
    toast({
      title: "Menu Item Added",
      description: `Added "${menuItem.label}" to the menu.`
    });
  };

  // Update an existing menu item
  const updateMenuItem = (menuItem: MenuItem) => {
    setProject(prev => {
      const index = prev.menuItems.findIndex(item => item.id === menuItem.id);
      if (index === -1) return prev;
      
      const newItems = [...prev.menuItems];
      newItems[index] = menuItem;
      return { ...prev, menuItems: newItems };
    });
  };

  // Remove a menu item
  const removeMenuItem = (id: string) => {
    setProject(prev => {
      const newItems = prev.menuItems.filter(item => item.id !== id);
      return { ...prev, menuItems: newItems };
    });
    
    if (selectedMenuItem === id) {
      setSelectedMenuItem(project.menuItems.length > 1 ? project.menuItems[0].id : null);
    }
    
    toast({
      title: "Menu Item Removed",
      description: "The menu item has been removed."
    });
  };

  // Update selected menu index (for scrolling)
  const updateSelectedIndex = (index: number) => {
    setProject(prev => ({ ...prev, selectedIndex: index }));
  };

  // Save project to localStorage
  const saveProject = () => {
    try {
      localStorage.setItem(`oled-project-${project.id}`, JSON.stringify(project));
      toast({
        title: "Project Saved",
        description: "Your project has been saved locally."
      });
    } catch (error) {
      toast({
        title: "Error Saving Project",
        description: "Failed to save project to local storage.",
        variant: "destructive"
      });
    }
  };

  // Load project from localStorage
  const loadProject = (savedProject: Project) => {
    try {
      // Validate project schema
      const validatedProject = projectSchema.parse(savedProject);
      setProject(validatedProject);
      setSelectedMenuItem(validatedProject.menuItems.length > 0 ? validatedProject.menuItems[0].id : null);
      toast({
        title: "Project Loaded",
        description: `Loaded project: ${validatedProject.name}`
      });
    } catch (error) {
      toast({
        title: "Error Loading Project",
        description: "The project data is invalid.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg 
              className="w-8 h-8 text-primary" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect width="18" height="12" x="3" y="6" rx="2" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="7" y1="16" x2="12" y2="16" />
            </svg>
            <h1 className="text-xl font-bold">OLED Menu Builder</h1>
          </div>
          <div className="flex gap-2">
            <ProjectManager 
              project={project}
              onNewProject={createNewProject}
              onSaveProject={saveProject}
              onLoadProject={loadProject}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <TabsList>
              <TabsTrigger value="menu">Menu Builder</TabsTrigger>
              <TabsTrigger value="screen">Screen Editor</TabsTrigger>
              <TabsTrigger value="export">Export Code</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Label htmlFor="display-type" className="text-sm whitespace-nowrap">OLED Type:</Label>
                <Select 
                  value={project.displayType} 
                  onValueChange={handleDisplayTypeChange}
                >
                  <SelectTrigger id="display-type" className="w-[200px]">
                    <SelectValue placeholder="Select display type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={OLEDDisplayType.SSD1306_128x64}>SSD1306 128x64</SelectItem>
                    <SelectItem value={OLEDDisplayType.SSD1306_128x32}>SSD1306 128x32</SelectItem>
                    <SelectItem value={OLEDDisplayType.SH1106_128x64}>SH1106 128x64</SelectItem>
                    <SelectItem value={OLEDDisplayType.SSD1309_128x64}>SSD1309 128x64</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="scroll-direction" className="text-sm whitespace-nowrap">
                  Text Scroll: {textScrollDirection === 'ltr' ? 'Left→Right' : 'Right→Left'}
                </Label>
                <Switch
                  id="scroll-direction"
                  checked={textScrollDirection === 'ltr'}
                  onCheckedChange={handleScrollDirectionChange}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-6">
            {/* Left Panel - Preview */}
            <Card className="w-full md:w-1/3 h-auto md:h-[520px] flex-shrink-0">
              <CardContent className="p-4 h-full flex flex-col">
                <h2 className="text-lg font-semibold mb-2">OLED Preview</h2>
                <div className="flex-1 flex items-center justify-center">
                  <OLEDPreview 
                    project={project}
                    selectedMenuItem={activeTab === "menu" ? null : activeMenuItem}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right Panel - Editors */}
            <div className="flex-1">
              <TabsContent value="menu" className="mt-0 h-full">
                <MenuBuilder 
                  project={project}
                  onAddMenuItem={addMenuItem}
                  onUpdateMenuItem={updateMenuItem}
                  onRemoveMenuItem={removeMenuItem}
                  onSelectMenuItem={setSelectedMenuItem}
                  selectedMenuItemId={selectedMenuItem}
                  onUpdateSelectedIndex={updateSelectedIndex}
                />
              </TabsContent>

              <TabsContent value="screen" className="mt-0 h-full">
                {activeMenuItem ? (
                  <ScreenEditor 
                    menuItem={activeMenuItem}
                    displayWidth={project.width}
                    displayHeight={project.height}
                    onUpdateMenuItem={updateMenuItem}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full p-12 border rounded-lg border-dashed border-border">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">No Menu Item Selected</h3>
                      <p className="text-muted-foreground mb-4">Create or select a menu item to start editing its screen.</p>
                      <Button onClick={() => setActiveTab("menu")}>Go to Menu Builder</Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="export" className="mt-0 h-full">
                <CodeExporter project={project} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>

      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          OLED Menu Builder - Design menus for OLED displays on microcontrollers like ESP32 with SSD1306
        </div>
      </footer>
    </div>
  );
}
