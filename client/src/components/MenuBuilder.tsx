import { useState } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Project, MenuItem } from "@shared/schema";
import { getDefaultFont } from "@/lib/u8g2-fonts";
import IconUploader from "@/components/IconUploader";
import FontSelector from "@/components/FontSelector";
import { X, ChevronUp, ChevronDown, Plus, Edit, Trash2 } from "lucide-react";

interface MenuBuilderProps {
  project: Project;
  onAddMenuItem: (menuItem: MenuItem) => void;
  onUpdateMenuItem: (menuItem: MenuItem) => void;
  onRemoveMenuItem: (id: string) => void;
  onSelectMenuItem: (id: string | null) => void;
  selectedMenuItemId: string | null;
  onUpdateSelectedIndex: (index: number) => void;
}

export default function MenuBuilder({
  project,
  onAddMenuItem,
  onUpdateMenuItem,
  onRemoveMenuItem,
  onSelectMenuItem,
  selectedMenuItemId,
  onUpdateSelectedIndex
}: MenuBuilderProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newMenuLabel, setNewMenuLabel] = useState("");
  const [newMenuIcon, setNewMenuIcon] = useState<string | undefined>(undefined);
  const [newMenuFont, setNewMenuFont] = useState(getDefaultFont().name);

  // Handle creating or updating a menu item
  const handleSaveMenuItem = () => {
    // Make sure we have a label
    if (!newMenuLabel.trim()) {
      return;
    }

    if (editingItem) {
      // Update existing item
      const updatedItem: MenuItem = {
        ...editingItem,
        label: newMenuLabel,
        iconPath: newMenuIcon,
        font: newMenuFont
      };
      onUpdateMenuItem(updatedItem);
    } else {
      // Create new item
      const newItem: MenuItem = {
        id: nanoid(),
        label: newMenuLabel,
        iconPath: newMenuIcon,
        font: newMenuFont,
        screenElements: []
      };
      onAddMenuItem(newItem);
    }

    // Reset form and close dialog
    resetForm();
    setIsDialogOpen(false);
  };

  // Open dialog to add a new menu item
  const handleAddMenuItem = () => {
    setEditingItem(null);
    setNewMenuLabel("");
    setNewMenuIcon(undefined);
    setNewMenuFont(getDefaultFont().name);
    setIsDialogOpen(true);
  };

  // Open dialog to edit an existing menu item
  const handleEditMenuItem = (menuItem: MenuItem) => {
    setEditingItem(menuItem);
    setNewMenuLabel(menuItem.label);
    setNewMenuIcon(menuItem.iconPath);
    setNewMenuFont(menuItem.font);
    setIsDialogOpen(true);
  };

  // Reset the form
  const resetForm = () => {
    setEditingItem(null);
    setNewMenuLabel("");
    setNewMenuIcon(undefined);
    setNewMenuFont(getDefaultFont().name);
  };

  // Move menu item up
  const moveItemUp = (index: number) => {
    if (index <= 0) return;
    
    const newItems = [...project.menuItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    
    const updatedProject = { ...project, menuItems: newItems };
    if (project.selectedIndex === index) {
      onUpdateSelectedIndex(index - 1);
    } else if (project.selectedIndex === index - 1) {
      onUpdateSelectedIndex(index);
    }
  };

  // Move menu item down
  const moveItemDown = (index: number) => {
    if (index >= project.menuItems.length - 1) return;
    
    const newItems = [...project.menuItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    
    const updatedProject = { ...project, menuItems: newItems };
    if (project.selectedIndex === index) {
      onUpdateSelectedIndex(index + 1);
    } else if (project.selectedIndex === index + 1) {
      onUpdateSelectedIndex(index);
    }
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>
            Create and manage your menu items. The center item will be highlighted in the preview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleAddMenuItem} 
            className="mb-4 w-full"
            variant="outline"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Menu Item
          </Button>

          {project.menuItems.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No menu items yet. Click "Add Menu Item" to get started.</p>
            </div>
          ) : (
            <ScrollArea className="h-[360px] pr-4">
              <div className="space-y-2">
                {project.menuItems.map((item, index) => (
                  <div 
                    key={item.id}
                    className={`
                      flex items-center justify-between p-3 rounded-md border
                      ${selectedMenuItemId === item.id ? 'border-primary' : 'border-border'}
                      ${index === project.selectedIndex ? 'bg-secondary' : ''}
                    `}
                    onClick={() => onSelectMenuItem(item.id)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {item.iconPath && (
                        <div className="w-6 h-6 flex-shrink-0">
                          {/* We'd normally show the icon here, but for simplicity using a placeholder */}
                          <div className="w-full h-full rounded-full bg-accent flex items-center justify-center text-xs">
                            <span>ico</span>
                          </div>
                        </div>
                      )}
                      <span className="font-medium truncate">{item.label}</span>
                      {index === project.selectedIndex && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItemUp(index);
                        }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          moveItemDown(index);
                        }}
                        disabled={index === project.menuItems.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMenuItem(item);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveMenuItem(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {project.menuItems.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Selected Index: {project.selectedIndex}</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onUpdateSelectedIndex(Math.max(0, project.selectedIndex - 1))}
                    disabled={project.selectedIndex === 0}
                  >
                    <ChevronUp className="h-4 w-4 mr-1" /> Up
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onUpdateSelectedIndex(Math.min(project.menuItems.length - 1, project.selectedIndex + 1))}
                    disabled={project.selectedIndex === project.menuItems.length - 1}
                  >
                    <ChevronDown className="h-4 w-4 mr-1" /> Down
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for adding/editing menu items */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="menu-label">Menu Label</Label>
              <Input
                id="menu-label"
                placeholder="Enter menu label"
                value={newMenuLabel}
                onChange={(e) => setNewMenuLabel(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Font</Label>
              <FontSelector 
                selectedFont={newMenuFont} 
                onSelectFont={setNewMenuFont}
              />
            </div>

            <div className="grid gap-2">
              <Label>Icon (Optional)</Label>
              <IconUploader 
                iconPath={newMenuIcon} 
                onIconChange={setNewMenuIcon}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setIsDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveMenuItem}>
              {editingItem ? 'Update' : 'Add'} Menu Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
