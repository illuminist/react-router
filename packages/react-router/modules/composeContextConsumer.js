import React from "react";

function composeContextConsumer(contexts, children, values = []) {
  const [context, ...rest] = contexts;
  return context
    ? React.createElement(context.Consumer, {}, ctxValue =>
        composeContextConsumer(rest, children, [...values, ctxValue])
      )
    : children(...values);
}

export default composeContextConsumer;
