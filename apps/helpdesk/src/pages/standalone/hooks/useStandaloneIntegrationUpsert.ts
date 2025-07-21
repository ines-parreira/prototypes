import { useCallback, useMemo } from 'react'

import { fromJS } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    HANDOVER_DEFAULT_CONTENT_TYPE,
    HANDOVER_DEFAULT_METHOD,
    HANDOVER_INTEGRATION_NAME_PREFIX,
    INTEGRATIONS_MAPPING,
    TICKET_HANDOVER_TRIGGER,
} from 'pages/standalone/constants'
import {
    HelpdeskIntegrationOptions,
    HTTPIntegrationPayload,
} from 'pages/standalone/types'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getIntegrationById } from 'state/integrations/selectors'

export const useStandaloneIntegrationUpsert = (
    currentIntegrationId: number | null,
    requiredFieldsValues: Record<string, string>,
    onCreateSuccess: (integrationId: number) => void,
) => {
    const dispatch = useAppDispatch()
    const integration = useAppSelector(
        getIntegrationById(currentIntegrationId ? currentIntegrationId : -1),
    )

    const upsert = useCallback(
        (targetIntegration: string) => {
            if (!(targetIntegration in INTEGRATIONS_MAPPING)) {
                console.error(`Invalid integration type: ${targetIntegration}`)
                return
            }

            let schema =
                INTEGRATIONS_MAPPING[
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
                    true,
                    (resp: any) => {
                        if (!resp.id) {
                            console.error(
                                `Failed to create integration: ${resp.error}`,
                            )
                            return
                        }
                        onCreateSuccess(resp.id)
                    },
                ),
            )
        },
        [requiredFieldsValues, onCreateSuccess, integration, dispatch],
    )

    const currentIntegrationType = useMemo(
        () =>
            integration && integration.get('name')
                ? (integration
                      .get('name')
                      .split(HANDOVER_INTEGRATION_NAME_PREFIX)[1] ??
                  HelpdeskIntegrationOptions.ZENDESK)
                : HelpdeskIntegrationOptions.ZENDESK,
        [integration],
    )
    return { upsert, currentIntegrationType }
}
