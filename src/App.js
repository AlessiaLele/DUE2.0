import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage"; // assicurati che il path sia corretto
import Login from "./pages/Login";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/Login.html" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
