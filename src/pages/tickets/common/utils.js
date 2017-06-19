import {fromJS} from 'immutable'
import {getValuePropFromSourceType} from '../../../state/ticket/utils'
import {getActionTemplate} from './../../../utils'

export function displayUserNameFromSource(user, sourceType) {
    const valueProp = getValuePropFromSourceType(sourceType)
    const value = user[valueProp]

    let label = user.name || value

    // if is email channel and has a name, show the address next to the name
    if (sourceType === 'email') {
        if (user.name) {
            label = `${user.name} (${value})`
        } else {
            label = value
        }
    }

    return label
}

export function isTicketDifferent(currentTicket, nextTicket) {
    return !currentTicket.equals(nextTicket)
}

/**
 * Map file content type like 'image/png' to Font-Awesome class
 * @param {string} contentType E.G : 'image/png'
 * @returns {string}
 */
export function fileIconFromContentType(contentType) {
    if (contentType === 'application/pdf') {
        return 'fa-file-pdf-o'
    } else if (contentType.startsWith('image/')) {
        return 'fa-file-image-o'
    } else if (contentType === 'application/msword') {
        return 'fa-file-word-o'
    } else if (contentType.startsWith('text/')) {
        return 'fa-file-text-o'
    }

    return 'fa-file-o'
}

/**
 *  Take a list of integration actions' names, and return them sorted by type.
 *  i.e. [shopify_action1, shopify_action2, stripe_action1] => {shopify: [action1, action1], stripe: [action1]}
 *
 * @param actionsList: the list of actions' names
 * @returns {any} the dictionary of sorted actions' names
 */
export function getSortedIntegrationActionsNames(actionsList) {
    let sortedActions = fromJS({})

    actionsList.map(action => {
        const type = action.integrationType

        if (!sortedActions.get(type)) {
            sortedActions = sortedActions.set(type, fromJS([]))
        }

        sortedActions = sortedActions.set(type, sortedActions.get(type).push(action.name))
    })

    return sortedActions
}

/**
 * Take a list of integration actions (action object, not names), and return them sorted by type.
 * i.e. [shopify_action1, shopify_action2, stripe_action1] => {shopify: [action1, action1], stripe: [action1]}
 *
 * @param actionsList: the list of actions
 * @returns {any} the dictionary of sorted actions
 */
export function getSortedIntegrationActions(actionsList) {
    let sortedActions = fromJS({})

    actionsList.map(action => {
        const type = getActionTemplate(action.get('name')).integrationType || action.get('name')

        if (!sortedActions.get(type)) {
            sortedActions = sortedActions.set(type, fromJS([]))
        }

        sortedActions = sortedActions.set(type, sortedActions.get(type).push(action))
    })

    return sortedActions
}
