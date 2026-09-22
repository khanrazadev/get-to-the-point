import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ContentPage from "@/pages/ContentPage";
import HomePage from "@/pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/content/:contentId" element={<ContentPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
