import React from "react";

function composeContextProvider(contextValuePairs, children) {
  const [pair, ...rest] = contextValuePairs;
  return pair
    ? React.createElement(
        pair[0].Provider,
        { value: pair[1] },
        composeContextProvider(rest, children)
      )
    : children;
}

export default composeContextProvider;
