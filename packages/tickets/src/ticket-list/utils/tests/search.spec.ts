import { compressToEncodedURIComponent } from 'lz-string'

import {
    mockTicketCompact,
    mockTicketCompactCustomer,
} from '@gorgias/helpdesk-mocks'
import { SearchTicketsOrderBy as SearchTicketsOrderByValues } from '@gorgias/helpdesk-types'

import { TicketSearchSortableProperties } from '../../../types/ticket'
import { getTicketSearchDisplayData } from '../../../utils/search/ticketHighlights'
import type { SearchTicket } from '../../types/search'
import {
    decodeSearchFilters,
    getSortOrderFromField,
    getTicketSearchParams,
    toSearchTicketsOrderBy,
} from '../search'

describe('search utils', () => {
    describe('decodeSearchFilters', () => {
        it('returns an empty string when the encoded value is missing', () => {
            expect(decodeSearchFilters(null)).toBe('')
        })

        it('decodes a compressed filters value', () => {
            expect(
                decodeSearchFilters(
                    compressToEncodedURIComponent('status:open assignee:me'),
                ),
            ).toBe('status:open assignee:me')
        })
    })

    describe('getTicketSearchParams', () => {
        it('reads the query, filters, and cursor params', () => {
            const searchParams = new URLSearchParams({
                q: 'refund',
                filters: compressToEncodedURIComponent('status:open'),
                cursor: 'next-page',
            })

            expect(getTicketSearchParams(searchParams)).toEqual({
                query: 'refund',
                filters: 'status:open',
                cursor: 'next-page',
            })
        })
    })

    describe('toSearchTicketsOrderBy', () => {
        it('returns the provided order when it is supported', () => {
            expect(
                toSearchTicketsOrderBy(
                    SearchTicketsOrderByValues.LastMessageDatetimeAsc,
                ),
            ).toBe(SearchTicketsOrderByValues.LastMessageDatetimeAsc)
        })

        it('falls back to the default search order for unsupported values', () => {
            expect(toSearchTicketsOrderBy('not-a-valid-order')).toBe(
                SearchTicketsOrderByValues.LastMessageDatetimeDesc,
            )
        })
    })

    describe('getSortOrderFromField', () => {
        it('returns a descending search order for the provided field', () => {
            expect(
                getSortOrderFromField(
                    TicketSearchSortableProperties.LastMessageDatetime,
                    true,
                ),
            ).toBe(SearchTicketsOrderByValues.LastMessageDatetimeDesc)
        })

        it('returns an ascending search order for the provided field', () => {
            expect(
                getSortOrderFromField(
                    TicketSearchSortableProperties.CreatedDatetime,
                    false,
                ),
            ).toBe(SearchTicketsOrderByValues.CreatedDatetimeAsc)
        })
    })

    describe('getTicketSearchDisplayData', () => {
        it('prefers the highlighted sender name over other customer values', () => {
            const ticket = {
                ...mockTicketCompact({
                    id: 122,
                    subject: 'Fallback subject',
                    excerpt: 'Fallback excerpt',
                    customer: mockTicketCompactCustomer({
                        id: 455,
                        name: 'Fallback Customer',
                        email: 'customer@example.com',
                    }),
                }),
                highlights: {
                    subject: ['Highlighted subject'],
                    id: ['999'],
                    messages: {
                        body: ['Highlighted excerpt'],
                        from: {
                            name: ['Sender Name'],
                            address: ['sender@example.com'],
                        },
                        to: {
                            address: ['recipient@example.com'],
                        },
                    },
                },
            } as SearchTicket

            expect(getTicketSearchDisplayData(ticket)).toEqual({
                customer: 'Sender Name',
                subject: 'Highlighted subject',
                excerpt: 'Highlighted excerpt',
                ticketId: 'Ticket ID: 999',
            })
        })

        it('falls back to the highlighted sender address when name is missing', () => {
            const ticket = {
                ...mockTicketCompact({
                    id: 124,
                    customer: mockTicketCompactCustomer({
                        id: 457,
                        name: 'Fallback Customer',
                        email: 'customer@example.com',
                    }),
                }),
                highlights: {
                    messages: {
                        from: {
                            address: ['sender@example.com'],
                        },
                    },
                },
            } as SearchTicket

            expect(getTicketSearchDisplayData(ticket).customer).toBe(
                'sender@example.com',
            )
        })

        it('uses the highlighted recipient when sender highlights are missing', () => {
            const ticket = {
                ...mockTicketCompact({
                    id: 123,
                    customer: mockTicketCompactCustomer({
                        id: 456,
                        name: 'Fallback Customer',
                        email: 'customer@example.com',
                    }),
                }),
                highlights: {
                    messages: {
                        to: {
                            address: ['recipient@example.com'],
                        },
                    },
                },
            } as SearchTicket

            expect(getTicketSearchDisplayData(ticket).customer).toBe(
                'recipient@example.com',
            )
        })

        it('falls back to the ticket subject, excerpt, and id when highlights are missing', () => {
            const ticket = {
                ...mockTicketCompact({
                    id: 125,
                    subject: 'Fallback subject',
                    excerpt: 'Fallback excerpt',
                    customer: mockTicketCompactCustomer({
                        id: 458,
                        name: 'Fallback Customer',
                        email: 'customer@example.com',
                    }),
                }),
                highlights: {},
            } as SearchTicket

            expect(getTicketSearchDisplayData(ticket)).toEqual({
                customer: 'Fallback Customer',
                subject: 'Fallback subject',
                excerpt: 'Fallback excerpt',
                ticketId: '125',
            })
        })

        it('falls back to the customer name, email, then customer id when highlights are missing', () => {
            expect(
                getTicketSearchDisplayData({
                    ...mockTicketCompact({
                        id: 10,
                        customer: mockTicketCompactCustomer({
                            id: 20,
                            name: 'Named Customer',
                            email: 'named@example.com',
                        }),
                    }),
                    highlights: {},
                } as SearchTicket).customer,
            ).toBe('Named Customer')

            expect(
                getTicketSearchDisplayData({
                    ...mockTicketCompact({
                        id: 11,
                        customer: mockTicketCompactCustomer({
                            id: 21,
                            name: '',
                            email: 'email-only@example.com',
                        }),
                    }),
                    highlights: {},
                } as SearchTicket).customer,
            ).toBe('email-only@example.com')

            expect(
                getTicketSearchDisplayData({
                    ...mockTicketCompact({
                        id: 12,
                        customer: mockTicketCompactCustomer({
                            id: 22,
                            name: '',
                            email: '',
                        }),
                    }),
                    highlights: {},
                } as SearchTicket).customer,
            ).toBe('Customer #22')
        })
    })
})
