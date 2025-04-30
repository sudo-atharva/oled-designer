import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Project, projectSchema } from "@shared/schema";
import { Save, FolderOpen, Plus, Menu } from "lucide-react";

interface ProjectManagerProps {
  project: Project;
  onNewProject: (name: string) => void;
  onSaveProject: () => void;
  onLoadProject: (project: Project) => void;
}

export default function ProjectManager({
  project,
  onNewProject,
  onSaveProject,
  onLoadProject
}: ProjectManagerProps) {
  const { toast } = useToast();
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isLoadProjectDialogOpen, setIsLoadProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [savedProjects, setSavedProjects] = useState<{id: string; name: string}[]>([]);
  
  // Load list of saved projects from localStorage
  useEffect(() => {
    const projects: {id: string; name: string}[] = [];
    
    // Scan localStorage for oled-project-* keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('oled-project-')) {
        try {
          const projectData = JSON.parse(localStorage.getItem(key) || "");
          projects.push({
            id: projectData.id,
            name: projectData.name
          });
        } catch (error) {
          console.error("Error parsing saved project", error);
        }
      }
    }
    
    setSavedProjects(projects);
  }, [project]); // Refresh when current project changes
  
  // Create a new project
  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project name.",
        variant: "destructive"
      });
      return;
    }
    
    onNewProject(newProjectName);
    setNewProjectName("");
    setIsNewProjectDialogOpen(false);
  };
  
  // Load a project from localStorage
  const handleLoadProject = (projectId: string) => {
    try {
      const projectData = localStorage.getItem(`oled-project-${projectId}`);
      if (!projectData) {
        throw new Error("Project not found");
      }
      
      const parsedProject = JSON.parse(projectData);
      // Validate against schema
      const validatedProject = projectSchema.parse(parsedProject);
      
      onLoadProject(validatedProject);
      setIsLoadProjectDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error Loading Project",
        description: "Failed to load the selected project.",
        variant: "destructive"
      });
      console.error("Error loading project", error);
    }
  };
  
  return (
    <>
      {/* Project Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Menu className="h-4 w-4 mr-2" />
            Project
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Project: {project.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsNewProjectDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onSaveProject}>
            <Save className="h-4 w-4 mr-2" />
            Save Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsLoadProjectDialogOpen(true)}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Load Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* New Project Dialog */}
      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewProjectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProject}>
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Load Project Dialog */}
      <Dialog open={isLoadProjectDialogOpen} onOpenChange={setIsLoadProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {savedProjects.length === 0 ? (
              <div className="text-center p-4 border border-dashed rounded-md">
                <p className="text-muted-foreground">No saved projects found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedProjects.map(savedProject => (
                  <div
                    key={savedProject.id}
                    className="p-3 border rounded-md hover:bg-secondary cursor-pointer flex justify-between items-center"
                    onClick={() => handleLoadProject(savedProject.id)}
                  >
                    <span>{savedProject.name}</span>
                    <FolderOpen className="h-4 w-4" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLoadProjectDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
