import {fromJS} from 'immutable'
import {getValuePropFromSourceType} from '../../../state/ticket/utils'
import {getActionTemplate} from './../../../utils'

/**
 * Return the label of the given person
 * @param {Object} person - A user or a customer
 * @param {string} sourceType - The source type of a ticket message.
 * @returns {string|*} the label of the given person
 */
export function getPersonLabelFromSource(person, sourceType) {
    const addressProp = getValuePropFromSourceType(sourceType)
    let address = person[addressProp] || ''

    let label = person.name || address

    // if is email channel and has a name, show the address next to the name
    if (sourceType === 'email') {
        // shrink email address if too long
        if (address.length > 45) {
            address = `${address.slice(0, 20)}[...]${address.slice(address.length - 20)}`
        }

        if (person.name) {
            label = `${person.name} (${address})`
        } else {
            label = address
        }
    }

    return label
}

/**
 * Map file content type like 'image/png' to Font-Awesome class
 * @param {string} contentType E.G : 'image/png'
 * @returns {string}
 */
export function fileIconFromContentType(contentType) {
    if (contentType === 'application/pdf') {
        return 'picture_as_pdf'
    } else if (contentType.startsWith('image/')) {
        return 'photo_library'
    } else if (contentType === 'application/msword') {
        return 'library_books'
    } else if (contentType.startsWith('text/')) {
        return 'library_books'
    }

    return 'library_add'
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
