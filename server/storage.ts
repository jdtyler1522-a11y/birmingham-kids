import {
  users,
  favorites,
  type User,
  type UpsertUser,
  type Favorite,
  type InsertFavorite,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Favorites operations
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, directory: string, listingId: string): Promise<void>;
  getUserFavorites(userId: string, directory?: string): Promise<Favorite[]>;
  isFavorite(userId: string, directory: string, listingId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Favorites operations
  async addFavorite(favoriteData: InsertFavorite): Promise<Favorite | null> {
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, favoriteData.userId),
          eq(favorites.directory, favoriteData.directory),
          eq(favorites.listingId, favoriteData.listingId)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      return existing[0];
    }

    const [favorite] = await db
      .insert(favorites)
      .values(favoriteData)
      .returning();
    return favorite;
  }

  async removeFavorite(userId: string, directory: string, listingId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.directory, directory),
          eq(favorites.listingId, listingId)
        )
      );
  }

  async getUserFavorites(userId: string, directory?: string): Promise<Favorite[]> {
    const conditions = [eq(favorites.userId, userId)];
    if (directory) {
      conditions.push(eq(favorites.directory, directory));
    }
    
    return await db
      .select()
      .from(favorites)
      .where(and(...conditions));
  }

  async isFavorite(userId: string, directory: string, listingId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userId, userId),
          eq(favorites.directory, directory),
          eq(favorites.listingId, listingId)
        )
      )
      .limit(1);
    return !!result;
  }
}

export const storage = new DatabaseStorage();
