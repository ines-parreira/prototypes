import type { ReactNode } from 'react'

import type { RcsTestSendResponse } from 'AIJourney/queries/useRcsTestSend/useRcsTestSend'
import { isGorgiasApiError } from 'models/api/types'

type FieldErrorMap = Record<string, unknown>

export type RcsErrorView = {
    title: string
    rawMessage: string
    hint: ReactNode | null
    fieldErrors?: FieldErrorMap
    responseData?: RcsTestSendResponse
}

const NO_MSID_RE = /Integration (\d+) has no messaging_service_id in meta/
const NO_INTEGRATION_RE = /Integration (\d+) not found for account (\d+)/

export const buildRcsErrorView = (error: unknown): RcsErrorView => {
    if (!isGorgiasApiError(error)) {
        if (error instanceof Error) {
            return {
                title: 'Send failed',
                rawMessage: error.message,
                hint: 'Open the browser network tab on the failing request for response details.',
            }
        }
        return {
            title: 'Send failed',
            rawMessage: 'An unexpected error occurred',
            hint: null,
        }
    }

    const status = error.response.status
    const { msg } = error.response.data.error
    const data = (error.response.data.error as { data?: unknown }).data

    if (msg.startsWith('Failed to validate RCS test send request')) {
        return {
            title: 'Request validation failed',
            rawMessage: msg,
            hint: 'The server rejected the request body. Adjust the fields flagged below and resend.',
            fieldErrors: (data as FieldErrorMap | undefined) ?? undefined,
        }
    }

    if (msg.startsWith('No matching RCS template')) {
        const d = (data as Partial<RcsTestSendResponse> | undefined) ?? {}
        const templatesInPool =
            typeof d.templates_in_pool === 'number' ? d.templates_in_pool : null
        return {
            title: 'No matching RCS template',
            rawMessage: msg,
            hint:
                templatesInPool === 0 ? (
                    <>
                        This Twilio sub-account has zero RCS templates
                        provisioned. Run the convert RCS template provisioning
                        flow for this sub-account before any RCS send can
                        succeed.
                    </>
                ) : (
                    <>
                        The resolver could not match any configured template for
                        the chosen classification. Confirm that the right
                        template variants exist for this sub-account, or switch
                        to a payload combination that maps to an existing
                        template.
                    </>
                ),
            responseData: data as RcsTestSendResponse,
        }
    }

    const noMsid = NO_MSID_RE.exec(msg)
    if (noMsid) {
        const integrationId = noMsid[1]
        return {
            title: 'Phone integration is missing a Twilio Messaging Service',
            rawMessage: msg,
            hint: (
                <>
                    SMS integration <strong>{integrationId}</strong> has no{' '}
                    <code>messaging_service_id</code> on its <code>meta</code>.
                    Twilio sub-account provisioning never completed (or was
                    rolled back) for this phone number. Re-run sub-account
                    provisioning for this integration, or pick a different phone
                    integration that is fully provisioned.
                </>
            ),
        }
    }

    const noIntegration = NO_INTEGRATION_RE.exec(msg)
    if (noIntegration) {
        return {
            title: 'Phone integration unavailable',
            rawMessage: msg,
            hint: 'The selected integration is deleted, deactivated, or not assigned to this account. Reload the page and pick another phone number.',
        }
    }

    if (msg.startsWith('TwilioMessagingService not found')) {
        return {
            title: 'Twilio messaging service row missing',
            rawMessage: msg,
            hint: 'The integration references a messaging_service_id that has no matching TwilioMessagingService row. Sub-account provisioning is incomplete — finish provisioning before retrying.',
        }
    }

    return {
        title: `Send failed (${status})`,
        rawMessage: msg,
        hint: null,
    }
}
