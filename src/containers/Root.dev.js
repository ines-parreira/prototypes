import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import { ReduxRouter } from 'redux-router'

import Immutable from 'immutable'
import installDevTools from 'immutable-devtools'

installDevTools(Immutable)

class Root extends Component {
    render() {
        const { store } = this.props
        return (
            <Provider store={store}>
                <ReduxRouter />
            </Provider>
        )
    }
}

Root.propTypes = {
    store: PropTypes.object.isRequired
}

export default Root
