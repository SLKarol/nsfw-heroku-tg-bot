import { FC } from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";

import { currentUserHasLogin } from "../lib/user";

const PrivateRoute: FC<RouteProps> = ({ children, ...rest }) => {
  const hasToken = currentUserHasLogin();
  return (
    <Route
      {...rest}
      render={({ location }) =>
        hasToken ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/signin",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
