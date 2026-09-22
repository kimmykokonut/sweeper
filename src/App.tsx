import { createHashRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Primiera from "./pages/Primiera";
import ScoreCard from "./pages/ScoreCard";
import GameHistory from "./pages/GameHistory";

const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "primiera", element: <Primiera /> },
      { path: "score", element: <ScoreCard /> },
      { path: "history", element: <GameHistory /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
