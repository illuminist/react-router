import React from "react";
import { isValidElementType } from "react-is";
import PropTypes from "prop-types";
import invariant from "tiny-invariant";
import warning from "tiny-warning";

import RouterContext from "./RouterContext.js";
import HistoryContext from "./HistoryContext.js";
import LocationContext from "./LocationContext.js";
import MatchContext from "./MatchContext.js";
import StaticContextContext from "./StaticContextContext.js";
import matchPath from "./matchPath.js";

import composeContextConsumer from "./composeContextConsumer.js";
import composeContextProvider from "./composeContextProvider.js";

function isEmptyChildren(children) {
  return React.Children.count(children) === 0;
}

function evalChildrenDev(children, props, path) {
  const value = children(props);

  warning(
    value !== undefined,
    "You returned `undefined` from the `children` function of " +
      `<Route${path ? ` path="${path}"` : ""}>, but you ` +
      "should have returned a React element or `null`"
  );

  return value || null;
}

/**
 * The public API for matching a single path and rendering.
 */
class Route extends React.Component {
  render() {
    return composeContextConsumer(
      [LocationContext, MatchContext, HistoryContext, StaticContextContext],
      (locationContext, matchContext, history, staticContext) => {
        invariant(history, "You should not use <Route> outside a <Router>");

        const location = this.props.location || locationContext;
        const match = this.props.computedMatch
          ? this.props.computedMatch // <Switch> already computed the match for us
          : this.props.path
          ? matchPath(location.pathname, this.props)
          : matchContext;

        const props = { history, staticContext, location, match };

        let { children, component, render } = this.props;

        // Preact uses an empty array as children by
        // default, so use null if that's the case.
        if (Array.isArray(children) && children.length === 0) {
          children = null;
        }

        return composeContextProvider(
          [
            [RouterContext, props],
            [LocationContext, location],
            [MatchContext, match]
          ],
          // Use React.Fragment to forcefully make it as React node
          <React.Fragment>
            {props.match
              ? children
                ? typeof children === "function"
                  ? __DEV__
                    ? evalChildrenDev(children, props, this.props.path)
                    : children(props)
                  : children
                : component
                ? React.createElement(component, props)
                : render
                ? render(props)
                : null
              : typeof children === "function"
              ? __DEV__
                ? evalChildrenDev(children, props, this.props.path)
                : children(props)
              : null}
          </React.Fragment>
        );
      }
    );
  }
}

if (__DEV__) {
  Route.propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    component: (props, propName) => {
      if (props[propName] && !isValidElementType(props[propName])) {
        return new Error(
          `Invalid prop 'component' supplied to 'Route': the prop is not a valid React component`
        );
      }
    },
    exact: PropTypes.bool,
    location: PropTypes.object,
    path: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    render: PropTypes.func,
    sensitive: PropTypes.bool,
    strict: PropTypes.bool
  };

  Route.prototype.componentDidMount = function() {
    warning(
      !(
        this.props.children &&
        !isEmptyChildren(this.props.children) &&
        this.props.component
      ),
      "You should not use <Route component> and <Route children> in the same route; <Route component> will be ignored"
    );

    warning(
      !(
        this.props.children &&
        !isEmptyChildren(this.props.children) &&
        this.props.render
      ),
      "You should not use <Route render> and <Route children> in the same route; <Route render> will be ignored"
    );

    warning(
      !(this.props.component && this.props.render),
      "You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored"
    );
  };

  Route.prototype.componentDidUpdate = function(prevProps) {
    warning(
      !(this.props.location && !prevProps.location),
      '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!this.props.location && prevProps.location),
      '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  };
}

export default Route;
