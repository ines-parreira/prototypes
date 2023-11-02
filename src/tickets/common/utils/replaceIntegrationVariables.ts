import {fromJS, List, Map} from 'immutable'
import _capitalize from 'lodash/capitalize'

import {notify as notifyAction} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import getVariableWithValue from './getVariableWithValue'

export default function replaceIntegrationVariables(
    integrationType: string,
    ticketState: Map<any, any>,
    variable: string,
    newArgument: string,
    notify?: typeof notifyAction
) {
    let integrations = (
        ticketState.getIn(['customer', 'integrations'], fromJS([])) as List<any>
    ).filter((integration: Map<any, any>) => {
        return integration.get('__integration_type__') === integrationType
    })

    // if we have updated_at in customer, sort integrations by the update date so we use the most recent updates
    if (
        !integrations.isEmpty() &&
        (integrations.first() as Map<any, any>).getIn([
            'customer',
            'updated_at',
        ])
    ) {
        integrations = integrations
            .sortBy(
                (integration: Map<any, any>) =>
                    integration.getIn(['customer', 'updated_at']) as string
            )
            .reverse()
    }

    const integrationIds = integrations
        .map((_, integrationId) => integrationId)
        .toList()

    const integrationId = integrationIds.first()

    if (!integrationId && notify) {
        notify({
            type: NotificationStatus.Warning,
            title: `This customer does not have any ${_capitalize(
                integrationType
            )} information`,
        })
        return newArgument.replace(variable, '')
    }

    const variableConfig = getVariableWithValue(variable)
    let newVariable = variable.replace(
        `integrations.${integrationType}`,
        `integrations[${integrationId!}]`
    )

    if (variableConfig && variableConfig.replace != null) {
        newVariable = variableConfig.replace(
            fromJS({ticket: ticketState}),
            integrationId
        )
    }

    return newArgument.replace(variable, newVariable)
}
