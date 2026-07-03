import { Toaster } from "react-hot-toast";

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: "4px",
          background: "rgba(8, 16, 28, 0.85)",
          color: "#f7fbff",
          border: "1px solid rgba(255,255,255,0.18)",
        },
      }}
    />
  );
}
