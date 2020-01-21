import React from "react";
import invariant from "tiny-invariant";

import Context from "./RouterContext.js";
import HistoryContext from "./HistoryContext.js";
import LocationContext from "./LocationContext.js";
import MatchContext from "./MatchContext.js";
import matchPath from "./matchPath.js";

const useContext = React.useContext;

export function useHistory() {
  if (__DEV__) {
    invariant(
      typeof useContext === "function",
      "You must use React >= 16.8 in order to use useHistory()"
    );
  }

  return useContext(HistoryContext);
}

export function useLocation() {
  if (__DEV__) {
    invariant(
      typeof useContext === "function",
      "You must use React >= 16.8 in order to use useLocation()"
    );
  }

  return useContext(LocationContext);
}

export function useParams() {
  if (__DEV__) {
    invariant(
      typeof useContext === "function",
      "You must use React >= 16.8 in order to use useParams()"
    );
  }

  const match = useContext(MatchContext);
  return match ? match.params : {};
}

export function useRouteMatch(path) {
  if (__DEV__) {
    invariant(
      typeof useContext === "function",
      "You must use React >= 16.8 in order to use useRouteMatch()"
    );
  }

  const location = useLocation();
  const match = useContext(MatchContext);

  return path ? matchPath(location.pathname, path) : match;
}
