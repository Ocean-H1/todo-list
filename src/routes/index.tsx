import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";

const ToDo = lazy(() => import("../pages/ToDo/index"));
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
              <ToDo />
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
