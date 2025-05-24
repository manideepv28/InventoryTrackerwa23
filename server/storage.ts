import { users, products, type User, type InsertUser, type Product, type InsertProduct } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProducts(userId: number): Promise<Product[]>;
  getProduct(id: number, userId: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct, userId: number): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>, userId: number): Promise<Product | undefined>;
  deleteProduct(id: number, userId: number): Promise<boolean>;
  getProductBySku(sku: string, userId: number): Promise<Product | undefined>;
  
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private currentUserId: number;
  private currentProductId: number;
  public sessionStore: any;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  }

  private async initializeSampleData() {
    // Create a demo user with properly hashed password
    const hashedPassword = await this.hashPassword("demo123");
    const demoUser = await this.createUser({
      username: "demo@inventorypro.com",
      password: hashedPassword,
    });

    // Create sample products for the demo user
    const sampleProducts = [
      {
        name: "MacBook Pro 14-inch",
        sku: "MBP14-001",
        category: "Electronics",
        purchasePrice: 1999.99,
        sellingPrice: 2399.99,
        stock: 15
      },
      {
        name: "Wireless Gaming Mouse",
        sku: "WGM-002",
        category: "Electronics",
        purchasePrice: 79.99,
        sellingPrice: 99.99,
        stock: 3
      },
      {
        name: "Organic Cotton T-Shirt",
        sku: "OCT-003",
        category: "Clothing",
        purchasePrice: 14.99,
        sellingPrice: 24.99,
        stock: 8
      },
      {
        name: "Yoga Mat Premium",
        sku: "YMP-004",
        category: "Sports",
        purchasePrice: 29.99,
        sellingPrice: 49.99,
        stock: 2
      },
      {
        name: "Coffee Maker Deluxe",
        sku: "CMD-005",
        category: "Home & Garden",
        purchasePrice: 89.99,
        sellingPrice: 129.99,
        stock: 12
      },
      {
        name: "JavaScript Programming Guide",
        sku: "JSG-006",
        category: "Books",
        purchasePrice: 19.99,
        sellingPrice: 39.99,
        stock: 0
      }
    ];

    for (const product of sampleProducts) {
      await this.createProduct(product, demoUser.id);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProducts(userId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.userId === userId,
    );
  }

  async getProduct(id: number, userId: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    return product && product.userId === userId ? product : undefined;
  }

  async createProduct(insertProduct: InsertProduct, userId: number): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id, 
      userId,
      purchasePrice: insertProduct.purchasePrice.toString(),
      sellingPrice: insertProduct.sellingPrice.toString()
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>, userId: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product || product.userId !== userId) {
      return undefined;
    }

    const updatedProduct: Product = { 
      ...product, 
      ...updates,
      purchasePrice: updates.purchasePrice?.toString() || product.purchasePrice,
      sellingPrice: updates.sellingPrice?.toString() || product.sellingPrice
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number, userId: number): Promise<boolean> {
    const product = this.products.get(id);
    if (!product || product.userId !== userId) {
      return false;
    }
    return this.products.delete(id);
  }

  async getProductBySku(sku: string, userId: number): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.sku === sku && product.userId === userId,
    );
  }
}

export const storage = new MemStorage();
