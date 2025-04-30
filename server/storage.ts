import { 
  users, projects, type User, type InsertUser, 
  type Project, type ProjectRecord, type InsertProject 
} from "@shared/schema";
import { nanoid } from "nanoid";

// Extend the storage interface with methods for our application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project methods
  getProject(id: number): Promise<ProjectRecord | undefined>;
  getProjectsByUserId(userId: string): Promise<ProjectRecord[]>;
  createProject(project: InsertProject): Promise<ProjectRecord>;
  updateProject(id: number, data: Project): Promise<ProjectRecord | undefined>;
  deleteProject(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, ProjectRecord>;
  private userIdCounter: number;
  private projectIdCounter: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProject(id: number): Promise<ProjectRecord | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByUserId(userId: string): Promise<ProjectRecord[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }

  async createProject(insertProject: InsertProject): Promise<ProjectRecord> {
    const id = this.projectIdCounter++;
    const project: ProjectRecord = { ...insertProject, id };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, data: Project): Promise<ProjectRecord | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: ProjectRecord = {
      ...project,
      data
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
}

export const storage = new MemStorage();
