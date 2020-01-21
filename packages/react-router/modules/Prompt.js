import React from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";

import Lifecycle from "./Lifecycle.js";
import HistoryContext from "./HistoryContext.js";
import StaticContextContext from "./StaticContextContext.js";
import composeContextConsumer from "./composeContextConsumer.js";

/**
 * The public API for prompting the user before navigating away from a screen.
 */
function Prompt({ message, when = true }) {
  return composeContextConsumer(
    [HistoryContext, StaticContextContext],
    (history, staticContext) => {
      invariant(history, "You should not use <Prompt> outside a <Router>");

      if (!when || staticContext) return null;

      const method = history.block;

      return (
        <Lifecycle
          onMount={self => {
            self.release = method(message);
          }}
          onUpdate={(self, prevProps) => {
            if (prevProps.message !== message) {
              self.release();
              self.release = method(message);
            }
          }}
          onUnmount={self => {
            self.release();
          }}
          message={message}
        />
      );
    }
  );
}

if (__DEV__) {
  const messageType = PropTypes.oneOfType([PropTypes.func, PropTypes.string]);

  Prompt.propTypes = {
    when: PropTypes.bool,
    message: messageType.isRequired
  };
}

export default Prompt;
