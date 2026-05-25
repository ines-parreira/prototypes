import { isAxiosError } from 'axios'
import type { AxiosError } from 'axios'

import { render } from '@repo/testing'

import { buildRcsErrorView } from './rcsErrorView'

const makeGorgiasApiError = (
    msg: string,
    data: unknown = undefined,
    status = 400,
): AxiosError => {
    const error = new Error(msg) as AxiosError
    Object.assign(error, {
        isAxiosError: true,
        toJSON: () => ({}),
        config: {},
        response: {
            status,
            statusText: 'Bad Request',
            headers: {},
            config: {},
            data: { error: { msg, ...(data !== undefined && { data }) } },
        },
    })
    return error
}

describe('buildRcsErrorView', () => {
    it('returns a hint pointing at devtools for native Error instances', () => {
        const view = buildRcsErrorView(new Error('Network down'))

        expect(view.title).toBe('Send failed')
        expect(view.rawMessage).toBe('Network down')
        expect(view.hint).toBe(
            'Open the browser network tab on the failing request for response details.',
        )
    })

    it('falls back to a generic message for non-Error throwables', () => {
        const view = buildRcsErrorView('some string')

        expect(view.title).toBe('Send failed')
        expect(view.rawMessage).toBe('An unexpected error occurred')
        expect(view.hint).toBeNull()
    })

    it('parses pydantic validation errors and surfaces field errors', () => {
        const fieldErrors = { recipient_phone: ['must be E.164'] }
        const view = buildRcsErrorView(
            makeGorgiasApiError(
                'Failed to validate RCS test send request.',
                fieldErrors,
            ),
        )

        expect(view.title).toBe('Request validation failed')
        expect(view.fieldErrors).toEqual(fieldErrors)
        expect(view.hint).toBe(
            'The server rejected the request body. Adjust the fields flagged below and resend.',
        )
    })

    it('flags zero-template-pool as a provisioning gap on no-match errors', () => {
        const view = buildRcsErrorView(
            makeGorgiasApiError(
                'No matching RCS template for sub_account_sid=AC...; classification=rich_content; templates_in_pool=0',
                {
                    content_sid: null,
                    template_name: null,
                    variables: null,
                    message_classification: 'rich_content',
                    resolution_path: 'none',
                    twilio_message_sid: null,
                    warnings: [],
                    templates_in_pool: 0,
                },
            ),
        )

        expect(view.title).toBe('No matching RCS template')
        expect(view.responseData?.templates_in_pool).toBe(0)
        expect(view.responseData?.resolution_path).toBe('none')
        const { container } = render(<>{view.hint}</>)
        expect(container.textContent).toContain(
            'zero RCS templates provisioned',
        )
    })

    it('points at template-variant mismatch when the pool is non-empty on no-match errors', () => {
        const view = buildRcsErrorView(
            makeGorgiasApiError(
                'No matching RCS template for sub_account_sid=AC...',
                {
                    content_sid: null,
                    template_name: null,
                    variables: null,
                    message_classification: 'rich_content',
                    resolution_path: 'none',
                    twilio_message_sid: null,
                    warnings: [],
                    templates_in_pool: 14,
                },
            ),
        )

        expect(view.responseData?.templates_in_pool).toBe(14)
        const { container } = render(<>{view.hint}</>)
        expect(container.textContent).toContain(
            'could not match any configured template',
        )
    })

    it('identifies the integration when messaging_service_id is missing from meta', () => {
        const view = buildRcsErrorView(
            makeGorgiasApiError(
                'Integration 129251 has no messaging_service_id in meta',
            ),
        )

        expect(view.title).toBe(
            'Phone integration is missing a Twilio Messaging Service',
        )
        const { container } = render(<>{view.hint}</>)
        expect(container.textContent).toContain('129251')
        expect(container.textContent).toContain('sub-account provisioning')
    })

    it('explains a stale integration when not found for account', () => {
        const view = buildRcsErrorView(
            makeGorgiasApiError('Integration 999 not found for account 23104'),
        )

        expect(view.title).toBe('Phone integration unavailable')
        expect(view.hint).toBe(
            'The selected integration is deleted, deactivated, or not assigned to this account. Reload the page and pick another phone number.',
        )
    })

    it('explains a missing TwilioMessagingService row', () => {
        const view = buildRcsErrorView(
            makeGorgiasApiError(
                'TwilioMessagingService not found for messaging_service_id=42',
            ),
        )

        expect(view.title).toBe('Twilio messaging service row missing')
        expect(view.hint).toBe(
            'The integration references a messaging_service_id that has no matching TwilioMessagingService row. Sub-account provisioning is incomplete — finish provisioning before retrying.',
        )
    })

    it('falls through to a status-tagged title for unrecognized backend errors', () => {
        const view = buildRcsErrorView(
            makeGorgiasApiError('something else entirely', undefined, 422),
        )

        expect(view.title).toBe('Send failed (422)')
        expect(view.rawMessage).toBe('something else entirely')
        expect(view.hint).toBeNull()
    })

    it('isGorgiasApiError requires the axios.isAxiosError shape', () => {
        const plainObject = { response: { data: { error: { msg: 'x' } } } }
        const view = buildRcsErrorView(plainObject)

        expect(view.title).toBe('Send failed')
        expect(view.rawMessage).toBe('An unexpected error occurred')
        expect(isAxiosError(plainObject)).toBe(false)
    })
})
