import _isUndefined from 'lodash/isUndefined'
import {fromJS} from 'immutable'
import _pick from 'lodash/pick'
import {
    SUBMIT_CURRENT_USER_SUCCESS
} from '../../state/users/constants'
import {
    SUBMIT_TICKET_SUCCESS,
    RECORD_MACRO,
    ADD_ATTACHMENT_SUCCESS,
    ADD_TICKET_TAGS,
    SET_STATUS
} from '../../state/ticket/constants'
import {
    CREATE_MACRO_SUCCESS,
    UPDATE_MACRO_SUCCESS,
    DELETE_MACRO_SUCCESS
} from '../../state/macro/constants'
import {humanizeActionType} from './utils'

// List of actions that are tracked on Amplitude
const TRACKED_ACTIONS = [
    CREATE_MACRO_SUCCESS,
    UPDATE_MACRO_SUCCESS,
    DELETE_MACRO_SUCCESS,
    SUBMIT_TICKET_SUCCESS,
    RECORD_MACRO,
    ADD_ATTACHMENT_SUCCESS,
    ADD_TICKET_TAGS,
    SET_STATUS
]

// List of actions that require an update of user properties on Amplitude
const CONFIG_ACTIONS = [
    SUBMIT_CURRENT_USER_SUCCESS,
]

export const logEvent = (event, props) => {
    if (_isUndefined(window.amplitude)) {
        return
    }

    amplitude.getInstance().logEvent(event, props)
}

export const setUserProperties = (user) => {
    if (_isUndefined(window.amplitude)) {
        return
    }

    const domain = window.location.hostname.split('.')[0]
    amplitude.getInstance().setUserId(user.id)
    amplitude.getInstance().setUserProperties({
        account: domain,
        name: user.name,
        email: user.email,
        country: user.country,
        role: user.roles[0].name,
        created_at: user.created_datetime
    })
}

/**
 * Middleware tracking actions with Amplitude API
 * @param store
 */
const amplitudeTracker = store => next => action => {
    if (_isUndefined(window.amplitude)) {
        return next(action)
    }

    const ALL_ACTIONS = TRACKED_ACTIONS.concat(CONFIG_ACTIONS)
    if (ALL_ACTIONS.includes(action.type)) {
        let actionName = humanizeActionType(action.type)
        let actionProps = fromJS({action: action.type})
        const state = store.getState()

        switch (action.type) {
            case SUBMIT_CURRENT_USER_SUCCESS:
                // update information if current user information changes
                if (state.currentUser.get('id') === action.resp.id) {
                    setUserProperties(action.resp)
                }
                break
            case SET_STATUS:
                // temporarily defined its name since action type is not well formatted
                actionName = 'Updated ticket status'
                actionProps = actionProps.merge({
                    ticket: state.ticket.get('id'),
                    status: action.status,
                })
                break
            case ADD_TICKET_TAGS:
                // temporarily defined its name since action type is not well formatted
                actionName = 'Added tag'
                actionProps = actionProps.merge({
                    ticket: state.ticket.get('id'),
                })
                break
            case RECORD_MACRO:
                actionName = 'Used macro'
                actionProps = actionProps.merge({
                    id: action.macro.get('id'),
                    name: action.macro.get('name'),
                    ticket: _pick(state.ticket.toJS(), ['id', 'channel']),
                })
                break
            case ADD_ATTACHMENT_SUCCESS:
                actionProps = actionProps.merge({
                    ticket: state.ticket.get('id'),
                })
                break
            default:
                break
        }
        if (TRACKED_ACTIONS.includes(action.type)) {
            logEvent(actionName, actionProps.toJS())
        }
    }

    return next(action)
}


export default amplitudeTracker
