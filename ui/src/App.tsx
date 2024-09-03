import "./App.css";
import { QueryClient, QueryClientProvider } from "react-query";
import ThemeProvider from "./context/ThemeContext";
import { RouterProvider } from "react-router-dom";
import router from "./routes/Router";
import { UserProvider } from "./context/UserContext";
// dotenv.config();

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <RouterProvider router={router} />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
