import React from 'react'
import {render} from 'react-dom'
import Root from './pages/Root'
import {fromJS} from 'immutable'
import {browserHistory} from 'react-router'
import {syncHistoryWithStore} from 'react-router-redux'
import configureStore from './store/configureStore'

// `configureStore` below needs an object as the parameter so here we're making an
// object with immutable object props from a plain JS object.
const toImmutableProps = (plainObject) => {
    const immutableState = {}
    Object.keys(plainObject).forEach((key) => {
        immutableState[key] = fromJS(plainObject[key])
    })

    return immutableState
}

// Supply an initial state to redux for faster page loads. See #752
const store = configureStore(toImmutableProps(window.GORGIAS_STATE || {}))
const history = syncHistoryWithStore(browserHistory, store)

render(
    <Root history={history} store={store}/>,
    document.getElementById('App')
)
