import React from "react";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import warning from "tiny-warning";

import LocationContext from "./LocationContext.js";
import MatchContext from "./MatchContext.js";
import matchPath from "./matchPath.js";

import composeContextConsumer from "./composeContextConsumer.js";

/**
 * The public API for rendering the first <Route> that matches.
 */
class Switch extends React.Component {
  render() {
    return composeContextConsumer(
      [LocationContext, MatchContext],
      (contextLocation, matchContext) => {
        invariant(
          contextLocation,
          "You should not use <Switch> outside a <Router>"
        );

        const location = this.props.location || contextLocation;

        let element, match;

        // We use React.Children.forEach instead of React.Children.toArray().find()
        // here because toArray adds keys to all child elements and we do not want
        // to trigger an unmount/remount for two <Route>s that render the same
        // component at different URLs.
        React.Children.forEach(this.props.children, child => {
          if (match == null && React.isValidElement(child)) {
            element = child;

            const path = child.props.path || child.props.from;

            match = path
              ? matchPath(location.pathname, { ...child.props, path })
              : matchContext;
          }
        });

        return match
          ? React.cloneElement(element, { location, computedMatch: match })
          : null;
      }
    );
  }
}

if (__DEV__) {
  Switch.propTypes = {
    children: PropTypes.node,
    location: PropTypes.object
  };

  Switch.prototype.componentDidUpdate = function(prevProps) {
    warning(
      !(this.props.location && !prevProps.location),
      '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!this.props.location && prevProps.location),
      '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  };
}

export default Switch;
