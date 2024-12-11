"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  Star,
  StarOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUserAuth } from "../_utils/auth-context";
import {
  addItem,
  deleteItem,
  getFavoriteId,
} from "@/app/_services/bookfoo-service";

/**
 * SearchBar component that allows users to search for books and manage their favorites.
 */
export default function SearchBar() {
  // State variables
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [savingId, setSavingId] = useState(null);
  const itemsPerPage = 10;
  const { user } = useUserAuth();

  /**
   * Handles the search form submission and fetches book search results from the Open Library API.
   * @param {React.FormEvent<HTMLFormElement>} [e] - The form submit event.
   */
  const handleSearch = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      const filteredResults = data.docs.filter((book) => book.cover_i);
      setResults(filteredResults || []);
      setTotalPages(Math.ceil(filteredResults.length / itemsPerPage));
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the toggling of a book's favorite status.
   * @param {Object} book - The book object.
   */
  const handleToggleFavorite = async (book) => {
    if (!user) {
      setError("Please sign in to manage favorites");
      return;
    }

    const bookId = book.key.replace("/works/", "").trim();
    setSavingId(bookId);

    try {
      const itemId = await getFavoriteId(user.uid, book.key);

      if (itemId) {
        await deleteItem(user.uid, itemId);
      } else {
        const bookData = {
          key: book.key,
          title: book.title,
          author: book.author_name?.[0] || "Unknown Author",
          cover_i: book.cover_i,
          first_publish_year: book.first_publish_year,
        };
        await addItem(user.uid, bookData);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setError("Failed to update favorite status");
    } finally {
      setSavingId(null);
    }
  };

  /**
   * Renders a button to toggle the favorite status of a book.
   * @param {Object} book - The book object.
   * @returns {React.ReactElement} - The FavoriteButton component.
   */
  const FavoriteButton = ({ book }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const bookId = book.key.replace("/works/", "").trim();

    React.useEffect(() => {
      let mounted = true;

      const checkStatus = async () => {
        if (!user) {
          setCheckingStatus(false);
          return;
        }

        try {
          const itemId = await getFavoriteId(user.uid, book.key);
          if (mounted) {
            setIsFavorite(!!itemId);
          }
        } catch (error) {
          console.error("Error checking favorite status:", error);
        } finally {
          if (mounted) {
            setCheckingStatus(false);
          }
        }
      };

      checkStatus();
      return () => {
        mounted = false;
      };
    }, [user, book.key]);

    const isLoading = checkingStatus || savingId === bookId;

    return (
      <button
        onClick={() => handleToggleFavorite(book)}
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
  };

  /**
   * Retrieves the current page's search results.
   * @returns {Object[]} - The current page's search results.
   */
  const getCurrentPageResults = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return results.slice(startIndex, endIndex);
  };

  /**
   * Handles the page change event and scrolls to the top of the page.
   * @param {number} page - The new page number.
   */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto flex flex-col items-center justify-start w-full pt-12 pb-8">
      <div className="w-full max-w-2xl text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Find Your Next Book
        </h1>
        <p className="text-gray-600">Search through millions of books</p>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for books..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-6 py-3 pr-12 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="w-full max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-center">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="w-full max-w-4xl mx-auto mt-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 px-4 text-center">
            Search Results (Page {currentPage} of {totalPages})
          </h2>
          <div className="space-y-6 px-4">
            {getCurrentPageResults().map((book) => (
              <div
                key={book.key}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-6">
                  {book.cover_i && (
                    <div className="flex-shrink-0">
                      <img
                        src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                        alt={`Cover of ${book.title}`}
                        className="w-28 h-40 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <Link
                          href={`/bookfoo/book/${book.key.replace(
                            "/works/",
                            ""
                          )}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {book.title}
                        </Link>
                        <p className="text-gray-600">
                          by {book.author_name?.[0] || "Unknown Author"}
                        </p>
                        {book.first_publish_year && (
                          <p className="text-sm text-gray-500">
                            First published in {book.first_publish_year}
                          </p>
                        )}
                      </div>
                      <FavoriteButton book={book} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg border ${
                          currentPage === page
                            ? "bg-blue-500 text-white border-blue-500"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}