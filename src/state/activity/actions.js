import axios from 'axios'
import {fromJS} from 'immutable'
import {fetchPage} from '../views/actions'
import {notify} from '../../state/notifications/actions'
import * as currentAccountTypes from '../currentAccount/constants'
import * as billingTypes from '../billing/constants'
import * as viewsTypes from '../views/constants'
import * as types from './constants'
import * as ticketActions from '../ticket/actions'
import {shouldUpdateTicket, shouldUpdateView} from './utils'
import {isCurrentlyOnTicket, toQueryParams} from '../../utils'

const notificationSoundData = require('../../../audio/notification.mp3')
const notificationSound = new Audio(notificationSoundData)
notificationSound.load()

export const pollActivity = () => (dispatch, getState) => {
    const {activity, views, ticket} = getState()

    const loading = activity.getIn(['_internal', 'loading'], false)

    // don't send activity again if previous one is not done
    if (loading) {
        return dispatch({
            type: types.SUBMIT_ACTIVITY_DISCARD
        })
    }

    dispatch({
        type: types.SUBMIT_ACTIVITY_START
    })

    const params = {}

    // TODO @jebarjonet CHECK if something new before fetching
    // if currently on a view, check if has unseen updates on this view
    const activeViewId = views.getIn(['active', 'id'])
    if (shouldUpdateView(activeViewId, views)) {
        params.queryView = activeViewId
    }

    // if currently on a ticket, check if has unseen updates on this ticket
    if (shouldUpdateTicket(ticket.get('id'))) {
        params.queryTicket = ticket.get('id')
    }

    const previousTickets = activity.get('tickets', fromJS([]))

    return axios.get(`/api/activity/?${toQueryParams(params)}`, {timeout: 10000})
        .then((json = {}) => json.data)
        .then((resp = {}) => {
            // renaming variables since they are already used in upper scope
            const {views: _views, ticket: _ticket} = getState()
            const prevGitCommit = activity.get('git_commit')

            if (resp.git_commit && resp.git_commit !== prevGitCommit) {
                dispatch(notify({
                    style: 'banner',
                    type: 'info',
                    dismissible: false,
                    onClick: () => {
                        window.location.reload()
                    },
                    allowHtml: true,
                    message: `An update is available for Gorgias. Click <a>here</a> to reload the page and get the 
                    latest improvements.`
                }))
            }

            dispatch({
                type: types.SUBMIT_ACTIVITY_SUCCESS,
                resp
            })

            if (resp.views) {
                dispatch({
                    type: viewsTypes.UPDATE_VIEW_LIST,
                    items: resp.views
                })
            }

            const currentTickets = fromJS(resp.tickets || [])

            // comparing previous and current tickets from activity to trigger a sound notification if necessary
            const shouldSoundNotify = currentTickets
                .filter(t => t.get('has_something_new'))
                .some((currentTicket) => {
                    const previousTicket = previousTickets.find(t => t.get('id') === currentTicket.get('id'))
                    let isNew = false

                    // the ticket was not there the previous time, it is a new one
                    if (!previousTicket) {
                        isNew = true
                    }

                    // the ticket had not got something new, but now it has
                    if (!previousTicket.get('has_something_new')) {
                        isNew = true
                    }

                    // if currently on the ticket, no sound
                    if (isCurrentlyOnTicket(currentTicket.get('id'))) {
                        isNew = false
                    }

                    return isNew
                })

            if (shouldSoundNotify) {
                notificationSound.play()
            }

            // TODO @jebarjonet CHECK if something new before fetching
            // if currently on a view, ask for its auto refresh
            const _activeViewId = _views.getIn(['active', 'id'])
            if (shouldUpdateView(_activeViewId, _views)) {
                const isFetchingView = _views.getIn(['_internal', 'loading', 'fetchList'], false)
                    || _views.getIn(['_internal', 'loading', 'fetchListDiscreet'], false)

                // don't fetch view if it is currently fetching
                if (!isFetchingView) {
                    const isEditing = _views.getIn(['active', 'editMode'], false)

                    if (!isEditing) {
                        dispatch(fetchPage(null, true))
                    }
                }
            }

            // if currently on a ticket, ask for its auto refresh
            if (shouldUpdateTicket(_ticket.get('id'))) {
                const isFetchingView = _ticket.getIn(['_internal', 'loading', 'fetchTicket'], false)

                // don't fetch ticket if it is currently fetching
                if (!isFetchingView) {
                    dispatch(ticketActions.fetchTicket(_ticket.get('id'), false))
                }
            }

            if (resp.current_account) {
                dispatch({
                    type: currentAccountTypes.UPDATE_ACCOUNT_SUCCESS,
                    resp: resp.current_account
                })
            }

            if (resp.current_usage) {
                dispatch({
                    type: billingTypes.FETCH_CURRENT_USAGE_SUCCESS,
                    resp: resp.current_usage
                })
            }
        })
        .catch(error => {
            console.error('Failed polling activity', error)
            return dispatch({
                type: types.SUBMIT_ACTIVITY_ERROR,
                error,
            })
        })
}
