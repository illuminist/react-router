import React from "react";
import PropTypes from "prop-types";
import warning from "tiny-warning";

import HistoryContext from "./HistoryContext.js";
import LocationContext from "./LocationContext.js";
import MatchContext from "./MatchContext.js";
import RouterContext from "./RouterContext.js";
import StaticContextContext from "./StaticContextContext.js";

import composeContextProvider from "./composeContextProvider.js";

/**
 * The public API for putting history on context.
 */
class Router extends React.Component {
  static computeRootMatch(pathname) {
    return { path: "/", url: "/", params: {}, isExact: pathname === "/" };
  }

  constructor(props) {
    super(props);

    this.state = {
      location: props.history.location
    };

    // This is a bit of a hack. We have to start listening for location
    // changes here in the constructor in case there are any <Redirect>s
    // on the initial render. If there are, they will replace/push when
    // they mount and since cDM fires in children before parents, we may
    // get a new location before the <Router> is mounted.
    this._isMounted = false;
    this._pendingLocation = null;

    if (!props.staticContext) {
      this.unlisten = props.history.listen(location => {
        if (this._isMounted) {
          this.setState({ location });
        } else {
          this._pendingLocation = location;
        }
      });
    }
  }

  componentDidMount() {
    this._isMounted = true;

    if (this._pendingLocation) {
      this.setState({ location: this._pendingLocation });
    }
  }

  componentWillUnmount() {
    if (this.unlisten) this.unlisten();
  }

  render() {
    const match = Router.computeRootMatch(this.state.location.pathname);
    return composeContextProvider(
      [
        [
          RouterContext,
          {
            history: this.props.history,
            location: this.state.location,
            match,
            staticContext: this.props.staticContext
          }
        ],
        [HistoryContext, this.props.history],
        [LocationContext, this.state.location],
        [MatchContext, match],
        [StaticContextContext, this.props.staticContext]
      ],
      this.props.children || null
    );
  }
}

if (__DEV__) {
  Router.propTypes = {
    children: PropTypes.node,
    history: PropTypes.object.isRequired,
    staticContext: PropTypes.object
  };

  Router.prototype.componentDidUpdate = function(prevProps) {
    warning(
      prevProps.history === this.props.history,
      "You cannot change <Router history>"
    );
  };
}

export default Router;
