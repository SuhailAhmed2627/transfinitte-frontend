export const PORT_CLIENT = 8000;
export const PORT_SERVER = 3000;
export const ENV: "DEV" | "PROD" = "DEV";
export const BACKEND_URL =
	ENV === "DEV" ? `http://localhost:${PORT_SERVER}` : "";
export const FRONTEND_URL =
	ENV === "DEV" ? `http://localhost:${PORT_CLIENT}` : "";