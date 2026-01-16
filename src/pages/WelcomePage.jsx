import React from "react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/styleWP.css";

function WelcomePage() {
    return (
        <Container className="welcome-container">
            <Card className="glass-card text-center p-4" style={{ maxWidth: 800, minWidth: 600 }}>
                <CardContent>
                    <Typography variant="h3" className="welcome-title" gutterBottom>
                        Benvenuto in <span style={{ color: "#ffd700" }}>Hack & Sink</span> 👾
                    </Typography>
                    <div className="mt-5">
                        <Link to="/login" style={{ textDecoration: "none" }}>
                            <Button
                                variant="contained"
                                className="play-button"
                            >
                                ▶ Inizia a Giocare
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </Container>
    );
}

export default WelcomePage;