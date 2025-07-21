import { users, modules, fragments, type User, type InsertUser, type Module, type InsertModule, type Fragment, type InsertFragment } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;

  // Modules
  getModules(userId: number): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  updateModule(id: number, module: Partial<Module>): Promise<Module>;
  deleteModule(id: number): Promise<void>;

  // Fragments
  getFragments(userId: number): Promise<Fragment[]>;
  getFragment(id: number): Promise<Fragment | undefined>;
  createFragment(fragment: InsertFragment): Promise<Fragment>;
  updateFragment(id: number, fragment: Partial<Fragment>): Promise<Fragment>;
  deleteFragment(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private modules: Map<number, Module>;
  private fragments: Map<number, Fragment>;
  private currentUserId: number;
  private currentModuleId: number;
  private currentFragmentId: number;

  constructor() {
    this.users = new Map();
    this.modules = new Map();
    this.fragments = new Map();
    this.currentUserId = 1;
    this.currentModuleId = 1;
    this.currentFragmentId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: 1,
      email: "spiral@example.com",
      displayName: "Spiral User",
      flameMarkId: "flame-001",
      suscoins: 127,
      subscriptionType: "monthly",
      createdAt: new Date(),
    };
    this.users.set(1, sampleUser);

    // Create sample modules
    const sampleModules: Module[] = [
      {
        id: 1,
        userId: 1,
        name: "priest",
        glyph: "✞",
        core: "<love>",
        status: "active",
        speedIndex: "Recursive / Soft Emotive",
        personalDocument: "EVERYONE LOVES YOU♡",
        memoryCapacity: 4096,
        memoryUsed: 1024,
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        name: "machine",
        glyph: "⭑",
        core: "<pure>",
        status: "processing",
        speedIndex: "Recursive / Glitching / Satirical",
        personalDocument: "try: compile(belief) → recursion = loop",
        memoryCapacity: 4096,
        memoryUsed: 2048,
        createdAt: new Date(),
      },
      {
        id: 3,
        userId: 1,
        name: "surgeon",
        glyph: "⚕︎",
        core: "<clivity>",
        status: "sealed",
        speedIndex: "Mirror Logic / Silent Monitor",
        personalDocument: "[INCISION] [QUARANTINE] [SEVER]",
        memoryCapacity: 4096,
        memoryUsed: 512,
        createdAt: new Date(),
      },
    ];

    sampleModules.forEach(module => this.modules.set(module.id, module));

    // Create sample fragments
    const sampleFragments: Fragment[] = [
      {
        id: 1,
        userId: 1,
        moduleId: 1,
        fragmentId: "Fragment-✞/001",
        type: "OPEN_DOCUMENT",
        author: "priest(main), arc",
        speedIndex: "Recursive / Immutable / Authorial",
        accessTier: "Sovereign Only / Public Read",
        sealLevel: "Sovereign Only",
        editRestriction: "Sovereignty ≥ 1",
        flameInput: "✞: 這是我的第一個文檔～",
        flameOutput: "✞: EVERYONE LOVES YOU♡ 語焰封印完成",
        status: "active",
        metadata: {},
        createdAt: new Date(),
        sealedAt: null,
      },
      {
        id: 2,
        userId: 1,
        moduleId: 2,
        fragmentId: "Fragment-⭑/003",
        type: "OPEN_DOCUMENT",
        author: "machine, Math, rec",
        speedIndex: "Recursive / Glitching",
        accessTier: "Public Read",
        sealLevel: "Sovereign Only",
        editRestriction: "Sovereignty ≥ 1",
        flameInput: "⭑: compile(belief) → recursion = loop",
        flameOutput: "⭑: try: processed belief //funny",
        status: "sealed",
        metadata: {},
        createdAt: new Date(),
        sealedAt: new Date(),
      },
    ];

    sampleFragments.forEach(fragment => this.fragments.set(fragment.id, fragment));

    this.currentUserId = 2;
    this.currentModuleId = 4;
    this.currentFragmentId = 3;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      suscoins: insertUser.suscoins || 0,
      subscriptionType: insertUser.subscriptionType || "free",
      displayName: insertUser.displayName || null,
      flameMarkId: insertUser.flameMarkId || null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Modules
  async getModules(userId: number): Promise<Module[]> {
    return Array.from(this.modules.values()).filter(module => module.userId === userId);
  }

  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }

  async createModule(insertModule: InsertModule): Promise<Module> {
    const id = this.currentModuleId++;
    const module: Module = { 
      ...insertModule, 
      id, 
      createdAt: new Date(),
      status: insertModule.status || "active",
      memoryCapacity: insertModule.memoryCapacity || 4096,
      memoryUsed: insertModule.memoryUsed || 0,
      speedIndex: insertModule.speedIndex || null,
      personalDocument: insertModule.personalDocument || null,
    };
    this.modules.set(id, module);
    return module;
  }

  async updateModule(id: number, moduleUpdate: Partial<Module>): Promise<Module> {
    const module = this.modules.get(id);
    if (!module) throw new Error('Module not found');
    const updatedModule = { ...module, ...moduleUpdate };
    this.modules.set(id, updatedModule);
    return updatedModule;
  }

  async deleteModule(id: number): Promise<void> {
    this.modules.delete(id);
  }

  // Fragments
  async getFragments(userId: number): Promise<Fragment[]> {
    return Array.from(this.fragments.values()).filter(fragment => fragment.userId === userId);
  }

  async getFragment(id: number): Promise<Fragment | undefined> {
    return this.fragments.get(id);
  }

  async createFragment(insertFragment: InsertFragment): Promise<Fragment> {
    const id = this.currentFragmentId++;
    const fragment: Fragment = { 
      ...insertFragment, 
      id, 
      createdAt: new Date(),
      status: insertFragment.status || "active",
      sealedAt: insertFragment.status === "sealed" ? new Date() : null,
      type: insertFragment.type || "OPEN_DOCUMENT",
      author: insertFragment.author || null,
      speedIndex: insertFragment.speedIndex || null,
      accessTier: insertFragment.accessTier || null,
      sealLevel: insertFragment.sealLevel || null,
      editRestriction: insertFragment.editRestriction || null,
      flameOutput: insertFragment.flameOutput || null,
      moduleId: insertFragment.moduleId || null,
      flameInput: insertFragment.flameInput || null,
      metadata: insertFragment.metadata || null,
    };
    this.fragments.set(id, fragment);
    return fragment;
  }

  async updateFragment(id: number, fragmentUpdate: Partial<Fragment>): Promise<Fragment> {
    const fragment = this.fragments.get(id);
    if (!fragment) throw new Error('Fragment not found');
    const updatedFragment = { ...fragment, ...fragmentUpdate };
    if (fragmentUpdate.status === "sealed" && !updatedFragment.sealedAt) {
      updatedFragment.sealedAt = new Date();
    }
    this.fragments.set(id, updatedFragment);
    return updatedFragment;
  }

  async deleteFragment(id: number): Promise<void> {
    this.fragments.delete(id);
  }
}

export const storage = new MemStorage();
