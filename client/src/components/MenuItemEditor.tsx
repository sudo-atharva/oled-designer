import { useState, useEffect } from "react";
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
import { Pencil, Save } from "lucide-react";
import { MenuItem } from "@shared/schema";
import FontSelector from "@/components/FontSelector";
import IconUploader from "@/components/IconUploader";

interface MenuItemEditorProps {
  menuItem: MenuItem;
  onUpdateMenuItem: (menuItem: MenuItem) => void;
}

export default function MenuItemEditor({ menuItem, onUpdateMenuItem }: MenuItemEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(menuItem.label);
  const [font, setFont] = useState(menuItem.font);
  const [iconPath, setIconPath] = useState(menuItem.iconPath);

  // Update local state when menuItem prop changes
  useEffect(() => {
    setLabel(menuItem.label);
    setFont(menuItem.font);
    setIconPath(menuItem.iconPath);
  }, [menuItem]);

  const handleSave = () => {
    if (!label.trim()) return;

    onUpdateMenuItem({
      ...menuItem,
      label,
      font,
      iconPath
    });
    
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>Menu Item Properties</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <Save className="h-4 w-4 mr-2" />
            ) : (
              <Pencil className="h-4 w-4 mr-2" />
            )}
            {isEditing ? "Save" : "Edit"}
          </Button>
        </div>
        <CardDescription>
          Configure the appearance of this menu item
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-label">Label</Label>
            {isEditing ? (
              <Input
                id="item-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Menu item label"
              />
            ) : (
              <div className="p-2 border rounded-md">{label}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-font">Font</Label>
            {isEditing ? (
              <FontSelector
                selectedFont={font}
                onSelectFont={setFont}
              />
            ) : (
              <div className="p-2 border rounded-md font-mono text-xs">{font}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Icon (Optional)</Label>
            {isEditing ? (
              <IconUploader
                iconPath={iconPath}
                onIconChange={setIconPath}
              />
            ) : (
              <div className="p-2 border rounded-md">
                {iconPath ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-xs">
                      <span>ico</span>
                    </div>
                    <span className="text-xs truncate">{iconPath}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No icon</span>
                )}
              </div>
            )}
          </div>

          {isEditing && (
            <Button className="w-full" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
