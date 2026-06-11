import { useCallback } from 'react'
import { Duration } from '@gorgias/toolkit'

import { history } from '@repo/routing'
import { isRecord } from '@repo/utils'

import { toast } from '@gorgias/axiom'
import type { UseChannelProps } from '@gorgias/realtime'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { isMigrationInProgress } from 'hooks/useWhatsAppMigration'
import { fetchNewPhoneNumbers } from 'models/phoneNumber/resources'
import { newPhoneNumbersFetched } from 'state/entities/phoneNumbers/actions'
import * as integrationsActions from 'state/integrations/actions'

import { parseMessageData } from './parseMessageData'

export const WHATSAPP_ONBOARDING_SUCCEEDED_EVENT =
    'whatsapp-onboarding.succeeded'
export const WHATSAPP_ONBOARDING_FAILED_EVENT = 'whatsapp-onboarding.failed'

const WHATSAPP_INTEGRATIONS_PATH =
    '/app/settings/integrations/whatsapp/integrations'

type WhatsAppOnboardingSuccessPayload = {
    integration_id?: number
    phone_number: string
}

type WhatsAppOnboardingFailedPayload = {
    phone_number: string
    error?: {
        code?: string | number
        message?: string
    }
}

type AblyMessage = Parameters<NonNullable<UseChannelProps['onMessage']>>[0]

function getSuccessPayload(
    data: unknown,
): WhatsAppOnboardingSuccessPayload | undefined {
    if (!isRecord(data) || typeof data.phone_number !== 'string') {
        return undefined
    }

    return {
        integration_id:
            typeof data.integration_id === 'number'
                ? data.integration_id
                : undefined,
        phone_number: data.phone_number,
    }
}

function getFailedPayload(
    data: unknown,
): WhatsAppOnboardingFailedPayload | undefined {
    if (!isRecord(data) || typeof data.phone_number !== 'string') {
        return undefined
    }

    const error = isRecord(data.error)
        ? {
              code:
                  typeof data.error.code === 'string' ||
                  typeof data.error.code === 'number'
                      ? data.error.code
                      : undefined,
              message:
                  typeof data.error.message === 'string'
                      ? data.error.message
                      : undefined,
          }
        : undefined

    return {
        phone_number: data.phone_number,
        error,
    }
}

export function useWhatsAppOnboardingRealtimeMessageHandler() {
    const dispatch = useAppDispatch()

    const navigateToWhatsAppIntegrations = useCallback(() => {
        if (window.location.pathname !== WHATSAPP_INTEGRATIONS_PATH) {
            history.push(WHATSAPP_INTEGRATIONS_PATH)
        }
    }, [])

    const handleWhatsAppOnboardingSuccessRealtimeMessage = useCallback(
        async (message: AblyMessage) => {
            const payload = getSuccessPayload(parseMessageData(message.data))

            if (!payload || isMigrationInProgress()) {
                return
            }

            navigateToWhatsAppIntegrations()

            toast.info(
                `WhatsApp successfully connected for number ${payload.phone_number}.`,
                { duration: Duration.seconds(10) },
            )
            dispatch(integrationsActions.fetchIntegrations() as any)

            const phoneNumbers = await fetchNewPhoneNumbers()
            if (phoneNumbers) {
                dispatch(newPhoneNumbersFetched(phoneNumbers.data))
            }
        },
        [dispatch, navigateToWhatsAppIntegrations],
    )

    const handleWhatsAppOnboardingFailedRealtimeMessage = useCallback(
        (message: AblyMessage) => {
            const payload = getFailedPayload(parseMessageData(message.data))

            if (!payload) {
                return
            }

            navigateToWhatsAppIntegrations()

            const toastMessage = payload.error?.message
                ? `${payload.error.message} (number: ${payload.phone_number})`
                : `Failed to connect WhatsApp for number ${payload.phone_number}. Please try again or contact support.`

            toast.error(toastMessage, { duration: Duration.seconds(10) })
        },
        [navigateToWhatsAppIntegrations],
    )

    return {
        handleWhatsAppOnboardingFailedRealtimeMessage,
        handleWhatsAppOnboardingSuccessRealtimeMessage,
    }
}
