// page.js
"use client";
import { useState } from "react";
import SearchBar from "./search-bar";

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <SearchBar className="flex-1" />
    </div>
  );
}
