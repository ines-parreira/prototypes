import {
    UpdatePhoneIntegrationSettings,
    useUpdatePhoneSettings,
} from '@gorgias/api-queries'
import {isEqual} from 'lodash'
import {useEffect} from 'react'

import {useFormContext} from 'react-hook-form'

import useAppDispatch from 'hooks/useAppDispatch'
import {DEFAULT_RECORDING_NOTIFICATION} from 'models/integration/constants'
import {
    PhoneIntegration,
    PhoneIntegrationMeta,
    VoiceMessage,
} from 'models/integration/types'
import {getVoiceMessagePayload} from 'pages/integrations/integration/components/voice/utils'
import {fetchIntegrations} from 'state/integrations/actions'
import {UPDATE_INTEGRATION_ERROR} from 'state/integrations/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {
    DEFAULT_TRANSCRIBE_PREFERENCES,
    DEFAULT_WAIT_TIME_PREFERENCES,
    RING_TIME_DEFAULT_VALUE,
} from './constants'

export type FormValues = Pick<PhoneIntegration, 'name'> & {
    meta: PhoneIntegrationMeta & {
        recording_notification: VoiceMessage
    }
}

export default function useVoicePreferencesForm(integration: PhoneIntegration) {
    const {
        reset,
        formState: {defaultValues},
    } = useFormContext<FormValues>()

    useEffect(() => {
        const newDefaultValues = getDefaultValues(integration)
        const shouldResetDefaultValues = !isEqual(
            defaultValues,
            newDefaultValues
        )

        if (shouldResetDefaultValues) {
            reset(newDefaultValues)
        }
    }, [defaultValues, integration, integration.meta, integration.name, reset])
}

export function useFormSubmit(integration: PhoneIntegration) {
    const dispatch = useAppDispatch()

    const {mutate: updatePhoneSettings} = useUpdatePhoneSettings({
        mutation: {
            onSuccess: () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Integration settings successfully updated.',
                    })
                )
                void dispatch(fetchIntegrations())
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

    const onSubmit = (data: FormValues) => {
        let newSettings: UpdatePhoneIntegrationSettings = {
            name: data.name,
            emoji: data.meta.emoji,
            phone_team_id: data.meta.phone_team_id,
            preferences: data.meta.preferences,
        }

        const isRecordingEnabled =
            data.meta.preferences.record_inbound_calls ||
            data.meta.preferences.record_outbound_calls

        if (data.meta.recording_notification && isRecordingEnabled) {
            const recordingNotificationPayload = getVoiceMessagePayload(
                data.meta.recording_notification
            )
            newSettings = recordingNotificationPayload
                ? {
                      ...newSettings,
                      recording_notification: recordingNotificationPayload,
                  }
                : newSettings
        }

        updatePhoneSettings({
            integrationId: integration.id,
            data: newSettings,
        })
    }

    return {onSubmit}
}

export const getDefaultValues = (integration: PhoneIntegration): FormValues => {
    return {
        name: integration.name,
        meta: {
            ...integration.meta,
            preferences: {
                ...integration.meta.preferences,
                ring_time:
                    integration.meta.preferences.ring_time ??
                    RING_TIME_DEFAULT_VALUE,
                transcribe:
                    integration.meta.preferences.transcribe ??
                    DEFAULT_TRANSCRIBE_PREFERENCES,
                wait_time:
                    integration.meta.preferences.wait_time ??
                    DEFAULT_WAIT_TIME_PREFERENCES,
            },
            recording_notification:
                integration.meta.recording_notification ??
                DEFAULT_RECORDING_NOTIFICATION,
        },
    }
}
