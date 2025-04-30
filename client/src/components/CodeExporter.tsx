import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";
import { exportProjectToJson } from "@/lib/oled-utils";
import { 
  generateHeader, 
  generateImplementation, 
  generateArduinoSketch 
} from "@/lib/code-templates";
import { Download, Copy, FileCode, FileJson } from "lucide-react";

interface CodeExporterProps {
  project: Project;
}

export default function CodeExporter({ project }: CodeExporterProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("arduino");

  // Helper to download code as a file
  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: `Downloading ${filename}`
    });
  };

  // Copy code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "Code has been copied to your clipboard"
        });
      },
      () => {
        toast({
          title: "Copy failed",
          description: "Failed to copy code to clipboard",
          variant: "destructive"
        });
      }
    );
  };

  // Generate the header file code
  const headerCode = generateHeader(project);
  
  // Generate the implementation file code
  const implementationCode = generateImplementation(project);
  
  // Generate the Arduino sketch (single file)
  const arduinoSketch = generateArduinoSketch(project);
  
  // Generate the JSON export
  const jsonExport = exportProjectToJson(project);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Code Export</CardTitle>
        <CardDescription>
          Generate Arduino/PlatformIO compatible code for your OLED menu
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="arduino">Arduino Sketch</TabsTrigger>
            <TabsTrigger value="header">Header (.h)</TabsTrigger>
            <TabsTrigger value="implementation">Implementation (.cpp)</TabsTrigger>
            <TabsTrigger value="json">JSON Config</TabsTrigger>
          </TabsList>
          
          <TabsContent value="arduino">
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <pre className="code-preview p-4">
                {arduinoSketch}
              </pre>
            </ScrollArea>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => downloadCode(arduinoSketch, `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.ino`)}>
                <Download className="h-4 w-4 mr-2" /> Download .ino
              </Button>
              <Button variant="outline" onClick={() => copyToClipboard(arduinoSketch)}>
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="header">
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <pre className="code-preview p-4">
                {headerCode}
              </pre>
            </ScrollArea>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => downloadCode(headerCode, `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.h`)}>
                <Download className="h-4 w-4 mr-2" /> Download .h
              </Button>
              <Button variant="outline" onClick={() => copyToClipboard(headerCode)}>
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="implementation">
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <pre className="code-preview p-4">
                {implementationCode}
              </pre>
            </ScrollArea>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => downloadCode(implementationCode, `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.cpp`)}>
                <Download className="h-4 w-4 mr-2" /> Download .cpp
              </Button>
              <Button variant="outline" onClick={() => copyToClipboard(implementationCode)}>
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="json">
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <pre className="code-preview p-4">
                {jsonExport}
              </pre>
            </ScrollArea>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => downloadCode(jsonExport, `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`)}>
                <Download className="h-4 w-4 mr-2" /> Download JSON
              </Button>
              <Button variant="outline" onClick={() => copyToClipboard(jsonExport)}>
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          <p>Usage Notes:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Arduino Sketch: Complete sketch for Arduino IDE</li>
            <li>Header/Implementation: Split files for PlatformIO projects</li>
            <li>JSON: Save your project configuration for later editing</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
}
