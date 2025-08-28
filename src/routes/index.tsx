import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";

const Home = lazy(() => import("../pages/Home/index"));
const Login = lazy(() => import("../pages/Login/index"));

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<div>Loading Header...</div>}>
              <Home />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: "/login",
      element: (
        <Suspense fallback={<div>Loading Header...</div>}>
          <Login />
        </Suspense>
      ),
    },
  ],
  {
    basename: process.env.NODE_ENV === "production" ? "/todo-list" : "/",
  }
);

export default router;
