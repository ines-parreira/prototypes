import { unescapeQuoteEntities } from '@repo/utils'
import type { Map } from 'immutable'
import { get, set } from '@gorgias/toolkit'
import { INTEGRATION_TYPE_WITH_VARIABLES } from 'config/integrations'
import type { notify as notifyAction } from 'state/notifications/actions'

import { renderObject } from './renderObject'
import { replaceIntegrationVariables } from './replaceIntegrationVariables'

export function replaceVariables(
    argument: string,
    ticket: Map<any, any> | null,
    currentUser: Map<any, any>,
    notify?: typeof notifyAction,
) {
    // If there's a var of format `ticket.customer.integrations.XXX`, then it's a dynamic variable.
    // Else, it would be `ticket.customer.integrations[XXX]`.
    let newArgument = unescapeQuoteEntities(argument)
    const variables = newArgument.match(
        /{{ticket\.customer\.integrations.[\w\d\]\[._-]+\|?([\w_]+\([^(]*\))?}}/g,
    )

    if (variables) {
        // If a variable is a dynamic variable, we try to replace `integrations.{type}` with
        // `integrations[correct-integration-id]`.
        variables.forEach((variable) => {
            INTEGRATION_TYPE_WITH_VARIABLES.forEach((integrationType) => {
                if (variable.includes('integrations.' + integrationType)) {
                    newArgument = replaceIntegrationVariables(
                        integrationType,
                        ticket!,
                        variable,
                        newArgument,
                        currentUser,
                        notify,
                    )
                }
            })
        })
    }

    const context = {
        ticket: ticket ? ticket.toJS() : ticket,
        current_user: currentUser ? currentUser.toJS() : currentUser,
    }
    const messages = get(context, ['ticket', 'messages']) as
        | unknown[]
        | undefined

    set(context, ['ticket', 'first_message'], messages?.[0])
    set(context, ['ticket', 'last_message'], messages?.[messages.length - 1])

    return renderObject(newArgument, context)
}
