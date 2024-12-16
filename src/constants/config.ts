
const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://localhost:4173",
    ],
    methodes: ["GET", "POSt", "PUT", "DELETE"],
    Credential: true,
};

const CHICHAT_TOKEN = "chitchat-token";

export { corsOptions, CHICHAT_TOKEN }