"use client";

import { Star, StarOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useUserAuth } from "@/app/_utils/auth-context";
import {
  addItem,
  deleteItem,
  getFavoriteId,
} from "@/app/_services/bookfoo-service";

/**
 * FavoriteButton component that allows users to add or remove a book from their favorites.
 * @param {Object} book - The book object.
 * @param {function} onFavoriteChange - A callback function to be called when the favorite status changes.
 */
export default function FavoriteButton({ book, onFavoriteChange }) {
  const { user } = useUserAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Checks the favorite status of the book for the current user.
   */
  useEffect(() => {
    async function checkFavoriteStatus() {
      if (user && book.key) {
        try {
          const itemId = await getFavoriteId(user.uid, book.key);
          setIsFavorite(!!itemId);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    checkFavoriteStatus();
  }, [user, book.key]);

  /**
   * Handles the toggling of the book's favorite status.
   */
  const handleToggleFavorite = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const itemId = await getFavoriteId(user.uid, book.key);

      if (itemId) {
        await deleteItem(user.uid, itemId);
      } else {
        await addItem(user.uid, book);
      }

      // Update the local state
      setIsFavorite(!isFavorite);

      // Notify the parent component of the change
      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Operation failed, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className="w-10 h-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : isFavorite ? (
        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
      ) : (
        <StarOff className="w-6 h-6 text-gray-500" />
      )}
    </button>
  );
}