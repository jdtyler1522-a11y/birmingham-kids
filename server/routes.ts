import type { Express, Request, Response } from "express";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";
import path from "path";
import express from "express";

export async function registerRoutes(app: Express) {
  // Auth middleware
  await setupAuth(app);

  // Get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user's favorites
  app.get('/api/favorites', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const directory = req.query.directory as string | undefined;
      const favorites = await storage.getUserFavorites(userId, directory);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Add a favorite
  app.post('/api/favorites', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { directory, listingId } = req.body;
      
      if (!directory || !listingId) {
        return res.status(400).json({ message: "directory and listingId are required" });
      }

      const favorite = await storage.addFavorite({
        userId,
        directory,
        listingId,
      });
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  // Remove a favorite
  app.delete('/api/favorites', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { directory, listingId } = req.body;
      
      if (!directory || !listingId) {
        return res.status(400).json({ message: "directory and listingId are required" });
      }

      await storage.removeFavorite(userId, directory, listingId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Serve static files
  app.use(express.static('.', { 
    index: false, // Don't serve index.html automatically from root
    setHeaders: (res) => {
      res.set('Cache-Control', 'no-cache');
    }
  }));
  
  // Serve index.html for all non-API routes
  app.use((req: Request, res: Response, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(process.cwd(), 'index.html'));
  });
}
