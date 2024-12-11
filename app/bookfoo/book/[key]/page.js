"use client";

import { Star, StarOff, Loader2 } from "lucide-react";
import { useState, useEffect, use } from "react";
import { useUserAuth } from "@/app/_utils/auth-context";
import {
  addItem,
  deleteItem,
  getFavoriteId,
} from "@/app/_services/bookfoo-service";

export default function BookIntro({ params }) {
  // Get the current user from the authentication context
  const { user } = useUserAuth();

  // Get the book key from the URL parameters
  const bookKey = use(params).key;

  // State variables to manage book data, loading state, and favorite status
  const [bookData, setBookData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  // Fetch the book data from the Open Library API when the component mounts
  useEffect(() => {
    fetch(`https://openlibrary.org/works/${bookKey}.json`)
      .then((response) => response.json())
      .then((data) => setBookData(data))
      .catch((error) => console.error("Error fetching book:", error));
  }, [bookKey]);

  // Check the favorite status of the book when the user or book key changes
  useEffect(() => {
    if (!user?.uid) return;

    let mounted = true;
    const workKey = `/works/${bookKey}`;

    const checkFavorite = async () => {
      try {
        const itemId = await getFavoriteId(user.uid, workKey);
        if (mounted) setFavoriteId(itemId);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavorite();
    const interval = setInterval(checkFavorite, 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user?.uid, bookKey]);

  // Handle toggling the favorite status of the book
  const handleToggleFavorite = async () => {
    if (!user?.uid || !bookData || isLoading) return;

    setIsLoading(true);
    try {
      if (favoriteId) {
        await deleteItem(user.uid, favoriteId);
        setFavoriteId(null);
      } else {
        const newItemId = await addItem(user.uid, {
          key: `/works/${bookKey}`,
          title: bookData.title || "Untitled",
          cover_i: bookData.covers?.[0] || null,
          author_name: bookData.authors?.[0]?.name || "Unknown Author",
          timestamp: new Date().toISOString(),
        });
        setFavoriteId(newItemId);
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      alert("Operation failed. Please try again.");
    }
    setIsLoading(false);
  };

  // Render the book introduction if the data is available, otherwise show a loading message
  if (!bookData) {
    return (
      <p className="text-gray-500 text-center mt-10">Loading book details...</p>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-10 p-5">
      <div className="flex-shrink-0 relative">
        <img
          src={`https://covers.openlibrary.org/b/id/${bookData.covers?.[0]}-L.jpg`}
          alt={`Cover of ${bookData.title}`}
          className="w-full max-w-sm h-auto rounded shadow-md"
        />
        <button
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : favoriteId ? (
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          ) : (
            <StarOff className="w-6 h-6 text-gray-500" />
          )}
        </button>
      </div>

      <div className="flex-grow">
        <h1 className="text-3xl font-bold text-gray-900">{bookData.title}</h1>
        <p className="mt-2 text-lg text-gray-900">
          <strong>Author:</strong>{" "}
          {bookData.authors?.[0]?.name || "Unknown Author"}
        </p>
        <p className="mt-2 text-lg text-gray-700">
          <strong>Published Year:</strong>{" "}
          {bookData.first_publish_date || "N/A"}
        </p>
        <p className="mt-2 text-lg text-gray-700">
          <strong>Subjects:</strong> {bookData.subjects?.join(", ") || "N/A"}
        </p>
        <p className="mt-4 text-gray-700 leading-relaxed">
          <strong>Description:</strong>{" "}
          {bookData.description?.value || "No description available"}
        </p>
      </div>
    </div>
  );
}