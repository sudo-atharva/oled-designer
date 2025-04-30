import { useState } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { MenuItem, ScreenElement, DataType } from "@shared/schema";
import MenuItemEditor from "@/components/MenuItemEditor";
import { Plus, X, MoveHorizontal, Type, Variable } from "lucide-react";
import { u8g2Fonts } from "@/lib/u8g2-fonts";

interface ScreenEditorProps {
  menuItem: MenuItem;
  displayWidth: number;
  displayHeight: number;
  onUpdateMenuItem: (menuItem: MenuItem) => void;
}

export default function ScreenEditor({
  menuItem,
  displayWidth,
  displayHeight,
  onUpdateMenuItem
}: ScreenEditorProps) {
  const [isAddingElement, setIsAddingElement] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [newElement, setNewElement] = useState<{
    text: string;
    x: number;
    y: number;
    font: string;
    dataType?: DataType;
    dataVariable?: string;
  }>({
    text: "",
    x: 10,
    y: 20,
    font: u8g2Fonts[0].name
  });

  // Add a new screen element
  const handleAddElement = () => {
    if (!newElement.text.trim()) return;

    const element: ScreenElement = {
      id: nanoid(),
      type: "text",
      x: newElement.x,
      y: newElement.y,
      text: newElement.text,
      font: newElement.font
    };

    if (newElement.dataType) {
      element.dataType = newElement.dataType;
      element.dataVariable = newElement.dataVariable || `var_${nanoid(4)}`;
    }

    const updatedMenuItem = {
      ...menuItem,
      screenElements: [...menuItem.screenElements, element]
    };

    onUpdateMenuItem(updatedMenuItem);
    resetNewElement();
    setIsAddingElement(false);
  };

  // Update an existing screen element
  const updateElement = (element: ScreenElement) => {
    const updatedElements = menuItem.screenElements.map(el => 
      el.id === element.id ? element : el
    );

    onUpdateMenuItem({
      ...menuItem,
      screenElements: updatedElements
    });
  };

  // Remove a screen element
  const removeElement = (id: string) => {
    const updatedElements = menuItem.screenElements.filter(el => el.id !== id);
    
    onUpdateMenuItem({
      ...menuItem,
      screenElements: updatedElements
    });
    
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  // Reset new element form
  const resetNewElement = () => {
    setNewElement({
      text: "",
      x: 10,
      y: 20,
      font: u8g2Fonts[0].name
    });
  };

  // Get the selected element
  const getSelectedElementData = (): ScreenElement | undefined => {
    if (!selectedElement) return undefined;
    return menuItem.screenElements.find(el => el.id === selectedElement);
  };

  const selectedElementData = getSelectedElementData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left Column - Screen Preview */}
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Screen Layout for "{menuItem.label}"</CardTitle>
            <CardDescription>
              Click + to add text elements. Click on elements to select them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsAddingElement(true);
                  setSelectedElement(null);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Text Element
              </Button>
            </div>

            <div className="relative mx-auto oled-display p-2">
              <div 
                className="relative canvas-bg-grid" 
                style={{ 
                  width: `${displayWidth}px`, 
                  height: `${displayHeight}px`, 
                  backgroundColor: 'black',
                  overflow: 'hidden'
                }}
              >
                {menuItem.screenElements.map(element => (
                  <div
                    key={element.id}
                    className={`screen-element ${selectedElement === element.id ? 'selected' : ''}`}
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      color: element.dataType ? '#00ff00' : 'white',
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    {element.text}
                    {element.dataType && (
                      <span 
                        className="ml-1 text-accent" 
                        style={{ fontSize: '9px' }}
                      >
                        {element.dataType === 'int' ? '[123]' : 
                         element.dataType === 'float' ? '[12.34]' : '[Text]'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center mt-2 text-xs text-muted-foreground">
                {displayWidth}x{displayHeight} - Click elements to edit
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Properties */}
      <div>
        {selectedElementData ? (
          <Card>
            <CardHeader>
              <CardTitle>Element Properties</CardTitle>
              <CardDescription>
                Edit the selected element
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="element-text">Text</Label>
                  <Input
                    id="element-text"
                    value={selectedElementData.text}
                    onChange={(e) => {
                      updateElement({
                        ...selectedElementData,
                        text: e.target.value
                      });
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="element-x">X Position</Label>
                    <Input
                      id="element-x"
                      type="number"
                      value={selectedElementData.x}
                      min={0}
                      max={displayWidth - 10}
                      onChange={(e) => {
                        updateElement({
                          ...selectedElementData,
                          x: parseInt(e.target.value) || 0
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="element-y">Y Position</Label>
                    <Input
                      id="element-y"
                      type="number"
                      value={selectedElementData.y}
                      min={0}
                      max={displayHeight - 10}
                      onChange={(e) => {
                        updateElement({
                          ...selectedElementData,
                          y: parseInt(e.target.value) || 0
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="element-data-type">Data Type</Label>
                  <Select
                    value={selectedElementData.dataType || "none"}
                    onValueChange={(value) => {
                      if (value === "none") {
                        // Remove data type
                        const { dataType, dataVariable, ...rest } = selectedElementData;
                        updateElement(rest);
                      } else {
                        updateElement({
                          ...selectedElementData,
                          dataType: value as DataType,
                          dataVariable: selectedElementData.dataVariable || `var_${nanoid(4)}`
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Static Text)</SelectItem>
                      <SelectItem value="int">Integer</SelectItem>
                      <SelectItem value="float">Float</SelectItem>
                      <SelectItem value="string">String</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedElementData.dataType && (
                  <div className="space-y-2">
                    <Label htmlFor="element-variable">Variable Name</Label>
                    <Input
                      id="element-variable"
                      value={selectedElementData.dataVariable || ""}
                      onChange={(e) => {
                        updateElement({
                          ...selectedElementData,
                          dataVariable: e.target.value
                        });
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This will be used in the generated code
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeElement(selectedElementData.id)}
              >
                <X className="h-4 w-4 mr-2" /> Remove
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedElement(null)}
              >
                Deselect
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <MenuItemEditor 
            menuItem={menuItem} 
            onUpdateMenuItem={onUpdateMenuItem} 
          />
        )}
      </div>

      {/* Dialog for adding new element */}
      <Dialog open={isAddingElement} onOpenChange={setIsAddingElement}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Text Element</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-element-text">Text</Label>
              <Input
                id="new-element-text"
                placeholder="Enter text"
                value={newElement.text}
                onChange={(e) => setNewElement({...newElement, text: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new-element-x">X Position</Label>
                <Input
                  id="new-element-x"
                  type="number"
                  value={newElement.x}
                  min={0}
                  max={displayWidth - 10}
                  onChange={(e) => setNewElement({
                    ...newElement, 
                    x: parseInt(e.target.value) || 0
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-element-y">Y Position</Label>
                <Input
                  id="new-element-y"
                  type="number"
                  value={newElement.y}
                  min={0}
                  max={displayHeight - 10}
                  onChange={(e) => setNewElement({
                    ...newElement, 
                    y: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-element-data-type">Data Type</Label>
              <Select
                value={newElement.dataType || "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    // Remove data type
                    const { dataType, dataVariable, ...rest } = newElement;
                    setNewElement(rest);
                  } else {
                    setNewElement({
                      ...newElement,
                      dataType: value as DataType,
                      dataVariable: `var_${nanoid(4)}`
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Static Text)</SelectItem>
                  <SelectItem value="int">Integer</SelectItem>
                  <SelectItem value="float">Float</SelectItem>
                  <SelectItem value="string">String</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newElement.dataType && (
              <div className="grid gap-2">
                <Label htmlFor="new-element-variable">Variable Name</Label>
                <Input
                  id="new-element-variable"
                  value={newElement.dataVariable || ""}
                  onChange={(e) => setNewElement({
                    ...newElement,
                    dataVariable: e.target.value
                  })}
                  placeholder="e.g. temperature"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetNewElement();
              setIsAddingElement(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddElement}>
              Add Element
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
