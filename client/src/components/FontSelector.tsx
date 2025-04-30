import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { u8g2Fonts } from "@/lib/u8g2-fonts";

interface FontSelectorProps {
  selectedFont: string;
  onSelectFont: (font: string) => void;
}

export default function FontSelector({ selectedFont, onSelectFont }: FontSelectorProps) {
  return (
    <Select value={selectedFont} onValueChange={onSelectFont}>
      <SelectTrigger className="font-mono text-xs">
        <SelectValue placeholder="Select font" />
      </SelectTrigger>
      <SelectContent>
        {u8g2Fonts.map(font => (
          <SelectItem key={font.name} value={font.name} className="font-mono text-xs">
            {font.name} ({font.description})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
