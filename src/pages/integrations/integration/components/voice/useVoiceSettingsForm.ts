import { merge } from 'lodash'

import {
    HttpResponse,
    PhoneIntegration,
    UpdateAllPhoneIntegrationSettings,
    useDeleteIntegration,
    useUpdateAllPhoneSettings,
} from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { useNotify } from 'hooks/useNotify'
import { isGorgiasApiError } from 'models/api/types'
import {
    DEFAULT_GREETING_MESSAGE,
    DEFAULT_RECORDING_NOTIFICATION,
    VOICEMAIL_DEFAULT_VOICE_MESSAGE,
} from 'models/integration/constants'
import history from 'pages/history'
import { fetchIntegrations } from 'state/integrations/actions'
import {
    DELETE_INTEGRATION_SUCCESS,
    UPDATE_INTEGRATION_ERROR,
} from 'state/integrations/constants'

import {
    DEFAULT_TRANSCRIBE_PREFERENCES,
    PHONE_INTEGRATION_BASE_URL,
} from './constants'

export function useFormSubmit(integration: PhoneIntegration) {
    const dispatch = useAppDispatch()
    const notify = useNotify()

    const { mutate: updateAllPhoneSettings } = useUpdateAllPhoneSettings({
        mutation: {
            onSuccess: () => {
                void notify.success(
                    'Integration settings successfully updated.',
                )

                void dispatch(fetchIntegrations())
                history.push(`${PHONE_INTEGRATION_BASE_URL}/integrations`)
            },
            onError: (error) => {
                void dispatch({
                    type: UPDATE_INTEGRATION_ERROR,
                    error,
                    verbose: true,
                })
            },
        },
    })

    const onSubmit = (data: UpdateAllPhoneIntegrationSettings) => {
        updateAllPhoneSettings({
            integrationId: integration.id,
            data,
        })
    }

    return { onSubmit }
}

export const useDeletePhoneIntegration = (integration: PhoneIntegration) => {
    const dispatch = useAppDispatch()
    const notify = useNotify()

    const { mutate: performDelete, isLoading: isDeleting } =
        useDeleteIntegration({
            mutation: {
                onSuccess: () => {
                    if (integration) {
                        dispatch({
                            type: DELETE_INTEGRATION_SUCCESS,
                            id: integration.id,
                        })
                        history.push('/app/settings/channels/phone')
                        void notify.success('Integration successfully deleted')
                    }
                },
                onError: (error: HttpResponse<unknown>) => {
                    const message = isGorgiasApiError(error)
                        ? error.response.data.error.msg
                        : 'Failed to delete integration'

                    void notify.error(message)
                },
            },
        })

    return { isDeleting, performDelete }
}

export const getDefaultValues = (
    integration: PhoneIntegration,
): UpdateAllPhoneIntegrationSettings => {
    const defaultValues = {
        meta: {
            preferences: {
                record_inbound_calls: false,
                record_outbound_calls: false,
                transcribe: DEFAULT_TRANSCRIBE_PREFERENCES,
                voicemail_outside_business_hours: false,
            },
            send_calls_to_voicemail: false,
            recording_notification: DEFAULT_RECORDING_NOTIFICATION,
            voicemail: {
                ...VOICEMAIL_DEFAULT_VOICE_MESSAGE,
                outside_business_hours: {
                    use_during_business_hours_settings: true,
                    ...VOICEMAIL_DEFAULT_VOICE_MESSAGE,
                },
            },
            greeting_message: DEFAULT_GREETING_MESSAGE,
        },
    }

    return merge(defaultValues, {
        name: integration.name,
        meta: integration.meta,
    })
}
