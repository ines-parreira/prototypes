import {fromJS} from 'immutable'
import moment from 'moment-timezone'
import Promise from 'promise-polyfill'
import includes from 'array-includes'

import configureStore from './store/configureStore'

// Polyfills
Array.prototype.includes = Array.prototype.includes || includes // eslint-disable-line no-extend-native
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

if (initialState.currentUser) {
    initMoment(initialState.currentUser)
}

export const store = configureStore(toImmutableProps(initialState))
