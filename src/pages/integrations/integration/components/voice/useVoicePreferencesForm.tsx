import { useEffect } from 'react'

import { isEqual, merge } from 'lodash'
import { useFormContext } from 'react-hook-form'

import {
    UpdatePhoneIntegrationSettings,
    useUpdatePhoneSettings,
} from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { DEPRECATED_DEFAULT_RECORDING_NOTIFICATION } from 'models/integration/constants'
import {
    PhoneIntegration,
    PhoneIntegrationMeta,
    VoiceMessage,
} from 'models/integration/types'
import { getVoiceMessagePayload } from 'pages/integrations/integration/components/voice/utils'
import { fetchIntegrations } from 'state/integrations/actions'
import { UPDATE_INTEGRATION_ERROR } from 'state/integrations/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

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
        formState: { defaultValues },
    } = useFormContext<FormValues>()

    useEffect(() => {
        const newDefaultValues = getDefaultValues(integration)
        const shouldResetDefaultValues = !isEqual(
            defaultValues,
            newDefaultValues,
        )

        if (shouldResetDefaultValues) {
            reset(newDefaultValues)
        }
    }, [defaultValues, integration, integration.meta, integration.name, reset])
}

export function useFormSubmit(integration: PhoneIntegration) {
    const dispatch = useAppDispatch()

    const { mutate: updatePhoneSettings } = useUpdatePhoneSettings({
        mutation: {
            onSuccess: () => {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Integration settings successfully updated.',
                    }),
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
            send_calls_to_voicemail: data.meta.send_calls_to_voicemail,
        }

        const isRecordingEnabled =
            data.meta.preferences.record_inbound_calls ||
            data.meta.preferences.record_outbound_calls

        if (data.meta.recording_notification && isRecordingEnabled) {
            const recordingNotificationPayload = getVoiceMessagePayload(
                data.meta.recording_notification,
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

    return { onSubmit }
}

export const getDefaultValues = (integration: PhoneIntegration): FormValues => {
    const defaultValues = {
        meta: {
            preferences: {
                record_inbound_calls: false,
                record_outbound_calls: false,
                ring_time: RING_TIME_DEFAULT_VALUE,
                transcribe: DEFAULT_TRANSCRIBE_PREFERENCES,
                voicemail_outside_business_hours: false,
                wait_time: DEFAULT_WAIT_TIME_PREFERENCES,
            },
            send_calls_to_voicemail: false,
            recording_notification: DEPRECATED_DEFAULT_RECORDING_NOTIFICATION,
        },
    }

    return merge(defaultValues, integration)
}
