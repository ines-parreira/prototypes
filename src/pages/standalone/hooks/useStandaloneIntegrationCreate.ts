import { useCallback } from 'react'

import { fromJS } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import intercomSchema from 'pages/standalone/assets/httpSchemas/ticket-intercom.json'
import zendeskSchema from 'pages/standalone/assets/httpSchemas/ticket-zendesk.json'
import {
    HANDOVER_DEFAULT_CONTENT_TYPE,
    HANDOVER_DEFAULT_METHOD,
    HANDOVER_INTEGRATION_NAME_PREFIX,
    TICKET_HANDOVER_TRIGGER,
} from 'pages/standalone/constants'
import {
    HelpdeskIntegration,
    HelpdeskIntegrationOptions,
    HTTPIntegrationPayload,
} from 'pages/standalone/types'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getIntegrationById } from 'state/integrations/selectors'

const integrationsMapping: HelpdeskIntegration = {
    zendesk: {
        schema: JSON.stringify(zendeskSchema),
        requiredFields: {
            subdomain: {
                label: 'Subdomain',
                slug: 'subdomain',
                secret: false,
            },
            basicAuth: {
                label: 'Basic Auth Token',
                slug: 'basicAuth',
                secret: true,
            },
        },
    },
    intercom: {
        schema: JSON.stringify(intercomSchema),
        requiredFields: {
            authToken: {
                label: 'Auth Bearer Token',
                slug: 'authToken',
                secret: true,
            },
        },
    },
}

export const useStandaloneIntegrationCreate = (
    currentIntegrationId: number | null,
    requiredFieldsValues: Record<string, string>,
    onCreateSuccess: (integrationId: number) => void,
) => {
    const dispatch = useAppDispatch()
    const integration = useAppSelector(
        getIntegrationById(currentIntegrationId ? currentIntegrationId : -1),
    )

    const create = useCallback(
        (targetIntegration: string) => {
            if (!(targetIntegration in integrationsMapping)) {
                console.error(`Invalid integration type: ${targetIntegration}`)
                return
            }

            let schema =
                integrationsMapping[
                    targetIntegration as HelpdeskIntegrationOptions
                ].schema

            Object.keys(requiredFieldsValues).forEach((element) => {
                schema = schema.replace(
                    `{{${element}}}`,
                    requiredFieldsValues[element],
                )
            })
            const schemaJson = JSON.parse(schema)

            const httpIntegration: HTTPIntegrationPayload = {
                name: `${HANDOVER_INTEGRATION_NAME_PREFIX}${targetIntegration}`,
                type: IntegrationType.Http,
                managed: true,
                description: `Integration for ${targetIntegration} handover`,
                http: {
                    url: schemaJson.url,
                    headers: schemaJson.headers,
                    request_content_type: HANDOVER_DEFAULT_CONTENT_TYPE,
                    response_content_type: HANDOVER_DEFAULT_CONTENT_TYPE,
                    method: HANDOVER_DEFAULT_METHOD,
                    triggers: {
                        [TICKET_HANDOVER_TRIGGER]: true,
                    },
                    form: schemaJson.body,
                },
            }

            if (integration && integration.get('id')) {
                httpIntegration.id = integration.get('id')
            }

            void dispatch(
                updateOrCreateIntegration(
                    fromJS(httpIntegration),
                    undefined,
                    undefined,
                    (resp: any) => {
                        if (!resp.ok || !resp.data?.id) {
                            console.error(
                                `Failed to create integration: ${resp.error}`,
                            )
                            return
                        }
                        const integrationId = resp.data.id
                        onCreateSuccess(integrationId)
                    },
                ),
            )
        },
        [requiredFieldsValues, onCreateSuccess, integration, dispatch],
    )
    return { create }
}
