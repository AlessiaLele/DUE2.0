import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// Material UI
import { Card, CardContent, Typography, TextField, Button, Divider } from "@mui/material";

export default function Lobby() {
    const [roomName, setRoomName] = useState("");
    const [joinId, setJoinId] = useState("");
    const navigate = useNavigate();

    const createRoom = () => {
        const id = roomName.trim() !== "" ? roomName.trim() : uuidv4();
        navigate(`/room/${id}`);
    };

    const joinRoom = () => {
        if (joinId.trim() !== "") {
            navigate(`/room/${joinId.trim()}`);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 ">
            <Card sx={{ width: 500, borderRadius: 3, boxShadow: 4, padding: 3 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Pronto ad <strong> hackerare </strong> il nemico?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Puoi creare una stanza privata per giocare con un amico oppure unirti a una stanza esistente.
                    </Typography>

                    {/* Creazione stanza */}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Dai un nome alla tua stanza "
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        variant="outlined"
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={createRoom}
                        sx={{ mb: 2, borderRadius: 2 }}
                    >
                        Crea stanza
                    </Button>

                    <Divider sx={{ my: 2 }}>Oppure</Divider>

                    {/* Join stanza esistente */}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="ID stanza"
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                        variant="outlined"
                    />
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={joinRoom}
                        sx={{
                            borderRadius: 2,
                            backgroundColor: "#28a745", // verde bootstrap
                            "&:hover": {
                                backgroundColor: "#218838"
                            }
                        }}
                    >
                        Unisciti
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}