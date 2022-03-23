import {fromJS, List, Map} from 'immutable'

import {getValuePropFromSourceType} from 'state/ticket/utils'
import {getActionTemplate} from 'utils'
import {ShopifyProductCardContentType} from 'constants/integrations/shopify'
import {TicketMessageSourceType} from 'business/types/ticket'
import {ActionTemplate} from 'types'

/**
 * Return the label of the given person
 * @param {Object} person - A user or a customer
 * @param {string} sourceType - The source type of a ticket message.
 * @returns {string|*} the label of the given person
 */
type Person = {
    name: string
    address?: string
}
export function getPersonLabelFromSource(
    person: Person,
    sourceType: TicketMessageSourceType
): string {
    const addressProp = getValuePropFromSourceType(sourceType)
    let address: string = (addressProp && person[addressProp]) || ''

    let label = person.name || address

    // if is email channel and has a name, show the address next to the name
    if (
        sourceType === TicketMessageSourceType.Email ||
        sourceType === TicketMessageSourceType.Phone ||
        sourceType === TicketMessageSourceType.Sms
    ) {
        // shrink email address if too long
        if (address.length > 45) {
            address = `${address.slice(0, 20)}[...]${address.slice(
                address.length - 20
            )}`
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
 * Map file content type like 'image/png' to Material-Icons name
 * @param {string} contentType E.G : 'image/png'
 * @returns {string}
 */
export function fileIconFromContentType(contentType: string): string {
    if (contentType === 'application/pdf') {
        return 'picture_as_pdf'
    } else if (contentType.startsWith('image/')) {
        return 'photo_library'
    } else if (contentType === 'application/msword') {
        return 'library_books'
    } else if (contentType.startsWith('text/')) {
        return 'library_books'
    } else if (contentType === ShopifyProductCardContentType) {
        return 'shopify'
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
export function getSortedIntegrationActionsNames(
    actionsList: ActionTemplate[]
) {
    let sortedActions: Map<any, any> = fromJS({})

    actionsList.map((action: ActionTemplate) => {
        const type = action.integrationType

        if (!sortedActions.get(type)) {
            sortedActions = sortedActions.set(type, fromJS([]))
        }

        sortedActions = sortedActions.set(
            type,
            (sortedActions.get(type) as List<any>).push(action.name)
        )
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
export function getSortedIntegrationActions(
    actionsList: List<any>
): Map<any, any> {
    let sortedActions: Map<any, any> = fromJS({})

    actionsList.map((action: Map<any, any>) => {
        const type =
            getActionTemplate(action.get('name'))?.integrationType ||
            action.get('name')

        if (!sortedActions.get(type)) {
            sortedActions = sortedActions.set(type, fromJS([]))
        }

        sortedActions = sortedActions.set(
            type,
            (sortedActions.get(type) as List<any>).push(action)
        )
    })

    return sortedActions
}
