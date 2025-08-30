import React from "react";

import { Link } from "react-router-dom";

import Button from "@mui/material/Button";

import Container from "@mui/material/Container";

import Typography from "@mui/material/Typography";

import Card from "@mui/material/Card";

import CardContent from "@mui/material/CardContent";

import "bootstrap/dist/css/bootstrap.min.css";

import "../assets/style1.css"; // resta valido per ulteriori personalizzazioni

function WelcomePage() {

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="shadow-lg p-3 mb-5 bg-white rounded text-center" style={{ maxWidth: 1000 }}>
                <CardContent>
                    <Typography variant="h4" gutterBottom>

                        Benvenuto su
                        <p><strong>Hack & Sink!!</strong></p>
                    </Typography>
                    <div className="mt-4">
                        <Link to="/login" style={{ textDecoration: "none" }}>
                            <Button

                                variant="contained"

                                color="primary"

                                size="large"

                                className="w-100"
                            >

                                Gioca
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </Container>

    );

}

export default WelcomePage;

