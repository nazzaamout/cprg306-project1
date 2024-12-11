"use client";

import { useState, useEffect } from "react";
import { getItems } from "@/app/_services/bookfoo-service";
import { useUserAuth } from "@/app/_utils/auth-context";
import Link from "next/link";
import FavoriteButton from "./favorite-button";

/**
 * MyFavorite component that displays the user's favorite books.
 */
export default function MyFavorite() {
  // State variables
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUserAuth();

  /**
   * Loads the user's favorite books from the backend.
   */
  const loadItems = async () => {
    if (!user) {
      setError("Please login to view your favorites");
      setIsLoading(false);
      return;
    }

    try {
      const favorites = await getItems(user.uid);
      setItems(favorites);
    } catch (err) {
      console.error("Error loading favorites:", err);
      setError("Failed to load favorites. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Loads the user's favorite books when the component mounts and the user is logged in.
   */
  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  /**
   * Handles the favorite change event and reloads the favorites after a short delay.
   */
  const handleFavoriteChange = async () => {
    // Delay for a short time to ensure the backend operation is complete
    setTimeout(loadItems, 100);
  };

  // Render the appropriate content based on the state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading your favorites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-gray-500">
          You haven't added any books to your favorites yet.
        </p>
        <Link
          href="/bookfoo"
          className="text-blue-500 hover:text-blue-700 underline"
        >
          Browse books to add some
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Favorites</h1>
      <div className="grid gap-6">
        {items.map((book) => (
          <div
            key={book.key}
            className="flex gap-4 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            {book.cover_i ? (
              <img
                src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                alt={`Cover of ${book.title}`}
                className="w-24 h-36 object-cover rounded"
              />
            ) : (
              <div className="w-24 h-36 bg-gray-200 flex items-center justify-center rounded">
                <p className="text-gray-400 text-sm text-center">No Cover</p>
              </div>
            )}

            <div className="flex-grow">
              <Link
                href={`/bookfoo/book/${book.key.replace("/works/", "")}`}
                className="text-lg font-semibold hover:text-blue-600 transition-colors"
              >
                {book.title}
              </Link>

              <p className="text-gray-600 mt-1">
                by {book.author_name || "Unknown Author"}
              </p>

              {book.timestamp && (
                <p className="text-sm text-gray-400 mt-2">
                  Added: {new Date(book.timestamp).toLocaleDateString()}
                </p>
              )}
            </div>
            <FavoriteButton
              book={book}
              onFavoriteChange={handleFavoriteChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
}