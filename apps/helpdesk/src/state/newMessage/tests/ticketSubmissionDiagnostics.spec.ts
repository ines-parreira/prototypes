import { reportError } from '@repo/logging'

import { TicketChannel, TicketMessageSourceType } from 'business/types/ticket'
import {
    getBrowserTicketSubmissionDiagnostics,
    getTicketMessageDiagnostics,
    haveDifferentTicketIds,
    reportTicketMessageSubmissionIdentityMismatch,
    ticketMessageSubmissionIdentityReportingEnabledContextKey,
} from 'state/newMessage/ticketSubmissionDiagnostics'

jest.mock('@repo/logging')

const reportErrorMock = reportError as jest.MockedFunction<typeof reportError>

describe('ticketSubmissionDiagnostics', () => {
    beforeEach(() => {
        reportErrorMock.mockClear()
    })

    describe('haveDifferentTicketIds', () => {
        it('returns true when both ticket ids are comparable and different', () => {
            expect(haveDifferentTicketIds('12', 13)).toBe(true)
        })

        it('returns false when ticket ids match numerically', () => {
            expect(haveDifferentTicketIds('12', 12)).toBe(false)
        })

        it.each([undefined, null, '', 'new', 'not-a-ticket-id'])(
            'returns false when one ticket id is not comparable: %p',
            (ticketId) => {
                expect(haveDifferentTicketIds(ticketId, 12)).toBe(false)
                expect(haveDifferentTicketIds(12, ticketId)).toBe(false)
            },
        )
    })

    describe('getTicketMessageDiagnostics', () => {
        it('returns safe metadata about the ticket message without body content', () => {
            expect(
                getTicketMessageDiagnostics({
                    ticket_id: 12,
                    source: { type: TicketMessageSourceType.Email },
                    channel: TicketChannel.Email,
                } as any),
            ).toEqual({
                ticket_id_new_message: 12,
                source_type: TicketMessageSourceType.Email,
                channel: TicketChannel.Email,
            })
        })

        it('omits optional metadata when the message fields are not present', () => {
            expect(getTicketMessageDiagnostics()).toEqual({
                ticket_id_new_message: undefined,
                source_type: undefined,
                channel: undefined,
            })
        })
    })

    describe('getBrowserTicketSubmissionDiagnostics', () => {
        it('returns browser context for the current page', () => {
            document.title = 'Ticket 12'

            expect(getBrowserTicketSubmissionDiagnostics()).toEqual({
                pathname: window.location.pathname,
                search: window.location.search,
                title: 'Ticket 12',
                document_ready_state: document.readyState,
                page_hidden: document.hidden,
                page_visible: !document.hidden,
            })
        })
    })

    describe('reportTicketMessageSubmissionIdentityMismatch', () => {
        it('reports a Sentry error with the stage fingerprint and diagnostic context', () => {
            reportTicketMessageSubmissionIdentityMismatch('submit_click', {
                [ticketMessageSubmissionIdentityReportingEnabledContextKey]: true,
                ticket_id_arg: '12',
                ticket_id_redux: 13,
            })

            expect(reportErrorMock).toHaveBeenCalledWith(
                expect.any(Error),
                {
                    extra: {
                        stage: 'submit_click',
                        [ticketMessageSubmissionIdentityReportingEnabledContextKey]: true,
                        ticket_id_arg: '12',
                        ticket_id_redux: 13,
                    },
                },
                ['ticket-message-submission-identity-mismatch', 'submit_click'],
            )
            const [reportedError] = reportErrorMock.mock.calls[0] as [Error]

            expect(reportedError.message).toBe(
                'Ticket message submission identity mismatch.',
            )
        })

        it('does not report when ticket submission identity reporting is disabled', () => {
            reportTicketMessageSubmissionIdentityMismatch('submit_click', {
                [ticketMessageSubmissionIdentityReportingEnabledContextKey]: false,
                ticket_id_arg: '12',
                ticket_id_redux: 13,
            })

            expect(reportErrorMock).not.toHaveBeenCalled()
        })
    })
})
