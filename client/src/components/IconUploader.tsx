import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { X, Upload } from "lucide-react";
import { 
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Define predefined icons that match the ones in the reference image
const PREDEFINED_ICONS = [
  { id: "knob", symbol: "⊕", name: "Knob/Dial" },
  { id: "sensor", symbol: "≡", name: "Sensor/Signal" },
  { id: "gauge", symbol: "⊗", name: "Gauge" },
  { id: "settings", symbol: "⊙", name: "Settings" },
  { id: "custom", symbol: "⊛", name: "Custom" }
];

interface IconUploaderProps {
  iconPath?: string;
  onIconChange: (iconPath?: string) => void;
}

export default function IconUploader({ iconPath, onIconChange }: IconUploaderProps) {
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string>(iconPath?.startsWith("icon:") ? iconPath : "custom");

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 100KB)
    if (file.size > 100 * 1024) {
      toast({
        title: "File too large",
        description: "Icon file should be less than 100KB.",
        variant: "destructive"
      });
      return;
    }

    // Create a data URL for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
      setSelectedIcon("custom");
      // In a real app, we would upload this file to a server
      // and get back a URL. For simplicity, we're just using the filename.
      onIconChange(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Handle predefined icon selection
  const handleIconSelect = (iconId: string) => {
    setSelectedIcon(iconId);
    if (iconId === "custom") {
      // If "custom" is selected, keep the current custom icon if any
      if (!iconPath || iconPath.startsWith("icon:")) {
        onIconChange(undefined);
        setPreviewUrl(null);
      }
    } else {
      // For predefined icons, use a special format: "icon:iconId"
      onIconChange(`icon:${iconId}`);
      setPreviewUrl(null);
    }
  };

  // Remove the icon
  const handleRemoveIcon = () => {
    setPreviewUrl(null);
    setSelectedIcon("custom");
    onIconChange(undefined);
  };

  return (
    <div className="space-y-4">
      <RadioGroup 
        value={selectedIcon}
        onValueChange={handleIconSelect}
        className="grid grid-cols-5 gap-2"
      >
        {PREDEFINED_ICONS.map(icon => (
          <div key={icon.id} className="flex flex-col items-center space-y-1">
            <RadioGroupItem 
              value={icon.id} 
              id={`icon-${icon.id}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`icon-${icon.id}`}
              className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <span className="text-2xl">{icon.symbol}</span>
              <span className="text-xs">{icon.name}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {selectedIcon === "custom" && (
        <div className="pt-2">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="icon-upload"
            />
            <label htmlFor="icon-upload">
              <Button variant="outline" size="sm" type="button" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {iconPath && !iconPath.startsWith("icon:") ? "Change Icon" : "Upload Icon"}
                </span>
              </Button>
            </label>
            
            {iconPath && !iconPath.startsWith("icon:") && (
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleRemoveIcon}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          {iconPath && !iconPath.startsWith("icon:") && (
            <div className="mt-2 p-2 border rounded-md flex items-center gap-2">
              {previewUrl ? (
                <div className="w-8 h-8">
                  <img 
                    src={previewUrl} 
                    alt="Icon preview" 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-xs">
                  <span>ico</span>
                </div>
              )}
              <span className="text-sm truncate">{iconPath}</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Upload small image files (JPG, PNG, SVG) up to 100KB
          </p>
        </div>
      )}
    </div>
  );
}
