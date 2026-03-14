import { createHashRouter } from "react-router-dom";
import App from "../App";
import Home from "../ui/home";
import Data from "../ui/Data";
import Stats from "../ui/Stats";
import System from "../ui/System";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/data",
        element: <Data />,
      },
      {
        path: "/stats",
        element: <Stats />,
      },
      {
        path: "/system",
        element: <System />,
      },
    ],
  },
]);

export default router;