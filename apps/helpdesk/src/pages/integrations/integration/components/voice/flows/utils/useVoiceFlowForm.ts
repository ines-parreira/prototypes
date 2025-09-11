import cloneDeep from 'lodash/cloneDeep'
import omit from 'lodash/omit'

import {
    PhoneIntegration,
    useUpdateAllPhoneSettings,
} from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'
import { DEFAULT_CALLBACK_REQUESTS } from 'models/integration/constants'

import { VoiceFlowNodeType } from '../constants'
import { VoiceFlowFormValues } from '../types'

export function useVoiceFlowForm(integration: PhoneIntegration) {
    const notify = useNotify()

    const getDefaultValues = (
        values?: VoiceFlowFormValues,
    ): VoiceFlowFormValues => {
        if (!values) {
            return {
                record_inbound_calls:
                    integration.meta.preferences?.record_inbound_calls || false,
                business_hours_id: integration.business_hours_id,
                first_step_id: '',
                steps: {},
            }
        }
        const stepsWithDefaults = Object.fromEntries(
            Object.entries(values.steps).map(([stepId, step]) => {
                switch (step.step_type) {
                    case VoiceFlowNodeType.Enqueue:
                        return [
                            stepId,
                            {
                                callback_requests: {
                                    ...cloneDeep(DEFAULT_CALLBACK_REQUESTS),
                                    ...step.callback_requests,
                                },
                                conditional_routing: false,
                                ...step,
                            },
                        ]
                    default:
                        return [stepId, step]
                }
            }),
        )
        return {
            ...values,
            steps: stepsWithDefaults,
        }
    }

    const { mutate: updateAllPhoneSettings } = useUpdateAllPhoneSettings({
        mutation: {
            onSuccess: () => {
                void notify.success(
                    'Changes to your Call Flow were successfully saved.',
                )
            },
            onError: () => {
                void notify.error('Failed to save changes to your Call Flow.')
            },
        },
    })

    const onSubmit = (data: VoiceFlowFormValues) => {
        updateAllPhoneSettings({
            integrationId: integration.id,
            data: {
                meta: {
                    flow: omit(data, [
                        'business_hours_id',
                        'record_inbound_calls',
                    ]),
                },
            },
        })
    }

    return {
        getDefaultValues,
        onSubmit,
    }
}
