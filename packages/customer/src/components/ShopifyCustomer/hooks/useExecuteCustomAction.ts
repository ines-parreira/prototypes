import hash from 'object-hash'

import { useExecuteAction } from '@gorgias/helpdesk-queries'
import type { ExecuteActionBody } from '@gorgias/helpdesk-types'

import type {
    ButtonConfig,
    Parameter,
} from '../components/CustomerInfo/CustomActions/utils/customActionTypes'

type ActionPayload = {
    method: string
    url: string
    params: Record<string, string>
    headers: Record<string, string>
    form: Record<string, string>
    json: unknown
    content_type?: string
}

type ExecuteCustomActionParams = {
    integrationId?: number
    customerId?: number
    ticketId?: string
    label: string
    action: ButtonConfig['action']
}

function flattenParameters(parameters: Parameter[]): Record<string, string> {
    const result: Record<string, string> = {}
    for (const { key, value } of parameters) {
        result[key] = value || ''
    }
    return result
}

function mapActionToPayload(action: ButtonConfig['action']): ActionPayload {
    const payload: ActionPayload = {
        method: action.method,
        url: action.url,
        params: flattenParameters(action.params),
        headers: flattenParameters(action.headers),
        form: {},
        json: {},
    }

    if (action.method !== 'GET') {
        payload.content_type = action.body.contentType
        if (action.body.contentType === 'application/x-www-form-urlencoded') {
            payload.form = flattenParameters(
                action.body['application/x-www-form-urlencoded'],
            )
        } else {
            payload.json = action.body['application/json']
        }
    }

    return payload
}

function generateActionId(
    actionName: string,
    customerId: string | undefined,
    integrationId: string | undefined,
    payload: ActionPayload,
): string {
    const identifier = [actionName, customerId, integrationId, hash(payload)]
    return identifier.join('-').replace(/\./g, '_')
}

function buildActionData(
    params: ExecuteCustomActionParams,
): ExecuteActionBody | null {
    if (params.customerId == null) return null

    const payload = mapActionToPayload(params.action)

    const actionId = generateActionId(
        'customHttpAction',
        params.customerId.toString(),
        params.integrationId?.toString(),
        payload,
    )

    return {
        action_name: 'customHttpAction',
        action_label: params.label,
        action_id: actionId,
        user_id: params.customerId,
        integration_id: params.integrationId,
        payload,
        ...(params.ticketId && { ticket_id: Number(params.ticketId) }),
    }
}

export function useExecuteCustomAction() {
    const mutation = useExecuteAction()

    return {
        ...mutation,
        mutate: (params: ExecuteCustomActionParams) => {
            const data = buildActionData(params)
            if (!data) {
                console.warn(
                    '[useExecuteCustomAction] Cannot execute action: customerId is missing',
                )
                return
            }
            mutation.mutate({ data })
        },
    }
}
