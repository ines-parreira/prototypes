import _ from 'lodash';
import {Map} from 'immutable'
import {
  CREATE_NEW_USER_SUCCESS,
  FETCH_CURRENT_USER_SUCCESS,
  UPDATE_USER_SUCCESS
} from '../../state/users/constants'
import {FETCH_SETTINGS_SUCCESS} from '../../state/settings/constants'
import {
  SUBMIT_TICKET_SUCCESS,
  FETCH_TICKET_SUCCESS,
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
    CREATE_NEW_USER_SUCCESS,
    CREATE_MACRO_SUCCESS,
    UPDATE_MACRO_SUCCESS,
    DELETE_MACRO_SUCCESS,
    SUBMIT_TICKET_SUCCESS,
    FETCH_TICKET_SUCCESS,
    RECORD_MACRO,
    ADD_ATTACHMENT_SUCCESS,
    ADD_TICKET_TAGS,
    SET_STATUS
]

const CONFIG_ACTIONS = [
    FETCH_CURRENT_USER_SUCCESS,
    UPDATE_USER_SUCCESS,
    FETCH_SETTINGS_SUCCESS
]
/**
 * Middleware tracking actions with Amplitude API
 * @param store
 */
const amplitudeTracker = store => next => action => {
    const ALL_ACTIONS = TRACKED_ACTIONS + CONFIG_ACTIONS;
    if (_.includes(ALL_ACTIONS, action.type)) {
        let actionName = humanizeActionType(action.type)
        let actionProps = Map({action: action.type});

        switch (action.type) {
            case FETCH_CURRENT_USER_SUCCESS:
                amplitude.getInstance().setUserId(action.resp.id)
                amplitude.getInstance().setUserProperties({
                    name: action.resp.name,
                    email: action.resp.email,
                    country: action.resp.country,
                    role: action.resp.roles[0].name
                })
                break;
            case UPDATE_USER_SUCCESS:
                // update information is current user update his information
                if (store.getState().currentUser.get('id') === action.resp.id) {
                    amplitude.getInstance().setUserProperties({
                        name: action.resp.name,
                        email: action.resp.email,
                        role: action.resp.roles[0].name
                    })
                }
                break;
            case FETCH_SETTINGS_SUCCESS:
                amplitude.getInstance().setUserProperties({
                    account: action.resp.account_domain
                })
                break;
            case SET_STATUS:
                // temporarily defined its name since action type is not well formatted
                actionName = 'Updated ticket status'
                actionProps = actionProps.merge({
                    id: store.getState().ticket.get('id'),
                    status: action.args.get('status')
                })
                break;
            case FETCH_TICKET_SUCCESS:
                actionProps = actionProps.merge(_.pick(action.resp, ['id']));
                break;
            case ADD_TICKET_TAGS:
                // temporarily defined its name since action type is not well formatted
                actionName = 'Added tag'
                actionProps = actionProps.merge({
                    ticket: _.pick(store.getState().ticket.toJS(), ['id'])
                })
                break;
            case RECORD_MACRO:
                actionName = 'Used macro'
                actionProps = actionProps.merge({
                    id: action.macro.get('id'),
                    name: action.macro.get('name'),
                    ticket: _.pick(store.getState().ticket.toJS(), ['id'])
                })
                break;
            case ADD_ATTACHMENT_SUCCESS:
                actionProps = actionProps.merge({
                    ticket: _.pick(store.getState().ticket.toJS(), ['id'])
                })
                break;
            default:
                break;
        }
        if (_.includes(TRACKED_ACTIONS, action.type)) {
            amplitude.getInstance().logEvent(actionName, actionProps.toJS())
        }
    }

    return next(action)
}

export default amplitudeTracker
