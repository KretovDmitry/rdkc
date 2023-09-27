import {
  ADMIN_ROUTE,
  LOGIN_ROUTE,
  REGISTRATION_ROUTE,
  REQUESTS_ROUTE,
  SCHEDULE_ROUTE,
} from "./utils/consts";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Request from "./pages/Request";
import Schedule from "./pages/Schedule";

export const authRoutes = [
  {
    path: ADMIN_ROUTE,
    Component: Admin,
  },
];
export const publicRoutes = [
  {
    path: LOGIN_ROUTE,
    Component: Auth,
  },
  {
    path: REGISTRATION_ROUTE,
    Component: Auth,
  },
  {
    path: REQUESTS_ROUTE,
    Component: Request,
  },
  {
    path: SCHEDULE_ROUTE,
    Component: Schedule,
  },
];
