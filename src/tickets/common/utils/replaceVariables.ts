import { Map } from 'immutable'
import _first from 'lodash/first'
import _get from 'lodash/get'
import _last from 'lodash/last'
import _set from 'lodash/set'

import { INTEGRATION_TYPE_WITH_VARIABLES } from 'config/integrations'
import { notify as notifyAction } from 'state/notifications/actions'
import { unescapeQuoteEntities } from 'utils/html'

import renderObject from './renderObject'
import replaceIntegrationVariables from './replaceIntegrationVariables'

export default function replaceVariables(
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
    _set(
        context,
        ['ticket', 'first_message'],
        _first(_get(context, ['ticket', 'messages'])),
    )
    _set(
        context,
        ['ticket', 'last_message'],
        _last(_get(context, ['ticket', 'messages'])),
    )

    return renderObject(newArgument, context)
}
