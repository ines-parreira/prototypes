import React from 'react'
import {render} from 'react-dom'
import {browserHistory} from 'react-router'
import Root from './pages/Root'
import {fromJS} from 'immutable'
import configureStore from './store/configureStore'
import moment from 'moment-timezone'
import Promise from 'promise-polyfill'

// polyfill for Promise
window.Promise = window.Promise || Promise

const initMoment = (currentUser) => {
    // set default locale and timezone
    if (currentUser.language) {
        moment.locale(currentUser.language)
    }

    if (currentUser.timezone) {
        moment.tz.setDefault(currentUser.timezone)
    }
}

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
const initialState = window.GORGIAS_STATE || {}
const store = configureStore(toImmutableProps(initialState))

if (initialState.currentUser) {
    initMoment(initialState.currentUser)
}

render(
    <Root history={browserHistory} store={store} />,
    document.getElementById('App')
)
