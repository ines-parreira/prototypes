import axios from 'axios'
import {fromJS} from 'immutable'
import Push from 'push.js'

import {fetchPage} from '../../state/views/actions'
import {notify} from '../../state/notifications/actions'
import * as currentAccountTypes from '../currentAccount/constants'
import * as billingTypes from '../billing/constants'
import * as viewsTypes from '../views/constants'
import * as types from './constants'
import {shouldUpdateView} from './utils'
import {toQueryParams, playNotificationSound} from '../../utils'

import * as viewsSelectors from '../views/selectors'
import {POLL_ACTIVITY_TIMEOUT} from '../../config'

export const pollActivity = () => (dispatch, getState) => {
    const {activity, views} = getState()

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

    return axios.get(`/api/activity/?${toQueryParams(params)}`, {timeout: POLL_ACTIVITY_TIMEOUT})
        .then((json = {}) => json.data)
        .then((resp = {}) => {
            const _state = getState()
            // renaming variables since they are already used in upper scope
            const {views: _views} = _state
            const prevGitCommit = activity.get('git_commit')

            if (resp.git_commit && resp.git_commit !== prevGitCommit) {
                dispatch(notify({
                    style: 'banner',
                    status: 'info',
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

            // TODO @jebarjonet CHECK if something new before fetching
            // if currently on a view, ask for its auto refresh
            const _activeViewId = _views.getIn(['active', 'id'])
            if (shouldUpdateView(_activeViewId, _views)) {
                const isFetchingView = viewsSelectors.isLoading('fetchList')(_state)
                    || viewsSelectors.isLoading('fetchListDiscreet')(_state)

                // don't fetch view if it is currently fetching
                if (!isFetchingView) {
                    const isEditing = _views.getIn(['active', 'editMode'], false)

                    if (!isEditing) {
                        dispatch(fetchPage(null, true))
                    }
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
        }, error => {
            console.error('Failed polling activity', error)
            return dispatch({
                type: types.SUBMIT_ACTIVITY_ERROR,
                error,
            })
        })
}


export const pollChats = () => (dispatch, getState) => {
    const {activity} = getState()

    const previousTickets = activity.get('tickets', fromJS([]))

    return axios.get('/api/activity/chats/', {timeout: 10000})
        .then((json = {}) => json.data)
        .then((resp = {}) => {
            dispatch({
                type: types.SUBMIT_CHATS_SUCCESS,
                resp
            })

            const currentTickets = fromJS(resp.tickets || [])

            // comparing previous and current tickets from activity to trigger a notification if necessary
            const shouldNotify = currentTickets
                .filter(t => t.get('is_unread'))
                .some((currentTicket) => {
                    const previousTicket = previousTickets.find(t => t.get('id') === currentTicket.get('id'))
                    let isNew = false

                    if (!previousTicket) {
                        // the ticket was not there the previous time, it is a new one
                        isNew = true
                    } else if (!previousTicket.get('is_unread')) {
                        // the ticket had not got something new, but now it has
                        isNew = true
                    }

                    return isNew
                })

            if (shouldNotify) {
                playNotificationSound()
                Push.create('New activity on Gorgias', {
                    body: 'A ticket needs your attention',
                    timeout: 5000,
                    icon: `${window.GORGIAS_ASSETS_URL || ''}/static/private/img/icons/logo.png`,
                    onClick: function () {
                        // send on helpdesk and close notification
                        window.focus()
                        this.close()
                    }
                })
            }
        }, error => {
            console.error('Failed polling chats', error)
            return dispatch({
                type: types.SUBMIT_ACTIVITY_ERROR,
                error,
            })
        })
}
