/**
 * @file layout.js
 * @description Root layout component for the BookFoo application
 * This file contains the main layout structure, authentication protection,
 * header component, and routing logic for the BookFoo application.
 */

"use client";
import "./globals.css";
import Link from "next/link";
import { AuthContextProvider, useUserAuth } from "./_utils/auth-context";
import { LogOut, Bookmark, Book } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Protected Route Component
 * Implements route protection logic for authenticated routes
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Protected route wrapper component
 */
function ProtectedRoute({ children }) {
  const { user } = useUserAuth();
  const pathname = usePathname();

  // List of routes that require authentication
  const protectedRoutes = ["/bookfoo", "/bookfoo/favorites"];

  // Check if current path requires protection
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Display authentication required message if user is not authenticated
  if (isProtectedRoute && !user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Book className="w-16 h-16 text-gray-400" />
        <p className="text-xl text-gray-600 font-medium">
          Please sign in to continue
        </p>
        <p className="text-sm text-gray-500">
          You need to be logged in to access this page
        </p>
      </div>
    );
  }

  return children;
}

/**
 * Header Component
 * Implements the main navigation header with authentication controls
 * and responsive design features
 * 
 * @returns {JSX.Element} Header component with navigation and auth controls
 */
function Header() {
  const { user, firebaseSignOut, gitHubSignIn } = useUserAuth();
  const [error, setError] = useState(null);
  const router = useRouter();

  /**
   * Handles the sign-in process with GitHub
   * Includes error handling for common authentication scenarios
   */
  const handleSignIn = async () => {
    try {
      setError(null);
      await gitHubSignIn();
    } catch (err) {
      if (err.code === "auth/popup-blocked") {
        setError("Please allow popups for this site to sign in");
      } else if (err.code === "auth/cancelled-popup-request") {
        setError("Sign in was cancelled");
      } else {
        setError("Failed to sign in. Please try again");
      }
      console.error(err);
    }
  };

  /**
   * Handles the sign-out process
   * Redirects to home page after successful sign-out
   */
  const handleSignOut = async () => {
    try {
      setError(null);
      await firebaseSignOut();
      router.push("/"); // Redirect to homepage after sign out
    } catch (err) {
      setError("Failed to sign out");
      console.error(err);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      {/* Main Navigation Area - Fixed Height */}
      <div className="h-[64px] px-6 flex items-center">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo and Brand */}
          <Link
            href="/bookfoo"
            className="text-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Book className="w-6 h-6" />
            <span className="bg-gradient-to-r from-white to-blue-100 text-transparent bg-clip-text">
              BookFoo
            </span>
          </Link>

          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            {user ? (
              // Authenticated User Navigation
              <>
                <Link
                  href="/"
                  className="p-2 text-white/90 hover:bg-white/15 rounded-lg transition-colors duration-200 relative group flex items-center"
                >
                  <span className="transform group-hover:scale-105 transition-transform duration-200">
                    {user.displayName}
                  </span>
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Profile
                  </span>
                </Link>
                <Link
                  href="/bookfoo/favorites"
                  className="p-2 text-white hover:bg-white/15 rounded-lg transition-colors duration-200 relative group"
                >
                  <Bookmark className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200" />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Favorites
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-white/90 hover:bg-white/15 rounded-lg transition-colors duration-200 relative group"
                >
                  <LogOut className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200" />
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    Sign Out
                  </span>
                </button>
              </>
            ) : (
              // Non-authenticated User Controls
              <button
                className="bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 transition-colors duration-200"
                onClick={handleSignIn}
              >
                Join BookFoo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message Area with Animation */}
      {error && (
        <div className="bg-red-500/10 animate-slideDown">
          <div className="container mx-auto px-6 py-3 text-sm text-red-200 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-200 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Root Layout Component
 * Provides the main application structure and layout
 * Wraps the entire application with authentication context
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} Root layout component
 */
export default function RootLayout({ children }) {
  return (
    <AuthContextProvider>
      <html lang="en" className="h-full">
        <body className="flex flex-col min-h-full bg-gray-50 text-gray-900">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto px-4 py-6">
              <ProtectedRoute>{children}</ProtectedRoute>
            </div>
          </main>
          <footer className="bg-gradient-to-r from-blue-600 to-blue-700 text-white/90 py-6 mt-auto">
            <div className="container mx-auto px-6 text-center">
              <p className="text-sm">
                © {new Date().getFullYear()} BookFoo. All rights reserved.
              </p>
            </div>
          </footer>
        </body>
      </html>
    </AuthContextProvider>
  );
}