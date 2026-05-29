import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import HeapSortAnalyzer from "./Home";
export default function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        {}
        <Route path="/" element={<HeapSortAnalyzer />} />
        
      </Routes>
    </BrowserRouter>
  );
}

