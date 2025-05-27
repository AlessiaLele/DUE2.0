import React from "react";
import { Link } from "react-router-dom";
//import "../assets/style1.css"; // adatta il percorso in base a dove metti il file CSS

function WelcomePage() {
    return (
        <>
            <header>Benvenuto su Due!!</header>
            <div className="center">
                <h2>
                    <Link to="/login" className="button">Play</Link>
                </h2>
            </div>
        </>
    );
}

export default WelcomePage;
