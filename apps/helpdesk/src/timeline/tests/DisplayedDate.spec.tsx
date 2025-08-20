import { render, screen } from '@testing-library/react'

import { TicketCompact } from '@gorgias/helpdesk-types'

import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import * as timelineItem from 'timeline/helpers/timelineItem'

import DisplayedDate from '../DisplayedDate'
import { SortOption } from '../types'

jest.mock('pages/common/utils/DatetimeLabel', () => {
    return jest.fn(() => <div>Mocked DatetimeLabel</div>)
})

const DatetimeLabelMock = DatetimeLabel as jest.MockedFunction<
    typeof DatetimeLabel
>

describe('DisplayedDate', () => {
    const mockTicket = {
        id: 1,
        created_datetime: '2021-01-01T00:00:00Z',
        last_message_datetime: '2021-01-02T00:00:00Z',
        last_received_message_datetime: '2021-01-03T00:00:00Z',
        updated_datetime: '2021-01-04T00:00:00Z',
    } as TicketCompact
    const mockItem = timelineItem.fromTicket(mockTicket)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when sortOption.key is created_datetime', () => {
        it('should render label and date', () => {
            const sortOption: SortOption = {
                key: 'created_datetime',
                order: 'asc',
                label: 'Created',
            }
            render(DisplayedDate(sortOption, mockItem))

            expect(screen.getByText(/Created/)).toBeInTheDocument()
            expect(screen.getByText('Mocked DatetimeLabel')).toBeInTheDocument()
        })

        it('should call DatetimeLabel with created_datetime', () => {
            const sortOption: SortOption = {
                key: 'created_datetime',
                order: 'asc',
                label: 'Created',
            }
            render(DisplayedDate(sortOption, mockItem))

            expect(DatetimeLabelMock).toHaveBeenCalledWith(
                {
                    dateTime: mockTicket.created_datetime,
                },
                {},
            )
        })
    })

    describe('when sortOption.key is not created_datetime', () => {
        it('should not display created_datetime label when key is last_message_datetime', () => {
            const sortOption: SortOption = {
                key: 'last_message_datetime',
                order: 'asc',
                label: 'Last updated',
            }
            const { queryByText } = render(DisplayedDate(sortOption, mockItem))

            expect(queryByText(/Created/)).not.toBeInTheDocument()

            expect(DatetimeLabelMock).toHaveBeenCalledWith(
                {
                    dateTime: mockTicket.last_message_datetime,
                },
                {},
            )
        })

        it('should use fallback date when sort key is last_received_message_datetime', () => {
            const sortOption: SortOption = {
                key: 'last_received_message_datetime',
                order: 'asc',
                label: 'Last received message',
            }
            const { queryByText } = render(DisplayedDate(sortOption, mockItem))

            expect(queryByText(/Created/)).not.toBeInTheDocument()

            expect(DatetimeLabelMock).toHaveBeenCalledWith(
                {
                    dateTime: mockTicket.last_received_message_datetime,
                },
                {},
            )
        })
    })

    describe('fallback behavior', () => {
        it('should use fallback date when sort key is not present on ticket', () => {
            const ticketWithMissingField = {
                ...mockTicket,
                last_received_message_datetime: null,
            } as TicketCompact

            const sortOption: SortOption = {
                key: 'last_received_message_datetime',
                order: 'asc',
                label: 'Last received message',
            }
            render(
                DisplayedDate(
                    sortOption,
                    timelineItem.fromTicket(ticketWithMissingField),
                ),
            )

            expect(DatetimeLabelMock).toHaveBeenCalledWith(
                {
                    dateTime: ticketWithMissingField.created_datetime,
                },
                {},
            )
        })

        it('should handle null values correctly', () => {
            const ticketWithNullValue = {
                ...mockTicket,
                last_received_message_datetime: null,
            } as TicketCompact

            const sortOption: SortOption = {
                key: 'last_received_message_datetime',
                order: 'asc',
                label: 'Last received message',
            }
            render(
                DisplayedDate(
                    sortOption,
                    timelineItem.fromTicket(ticketWithNullValue),
                ),
            )

            expect(DatetimeLabelMock).toHaveBeenCalledWith(
                {
                    dateTime: ticketWithNullValue.created_datetime,
                },
                {},
            )
        })

        it('should use created_datetime as fallback when ticket property is null', () => {
            const ticketWithNullLastMessage = {
                ...mockTicket,
                last_message_datetime: null,
            } as TicketCompact

            const sortOption: SortOption = {
                key: 'last_message_datetime',
                order: 'desc',
                label: 'Last updated',
            }
            render(
                DisplayedDate(
                    sortOption,
                    timelineItem.fromTicket(ticketWithNullLastMessage),
                ),
            )

            expect(DatetimeLabelMock).toHaveBeenCalledWith(
                {
                    dateTime: ticketWithNullLastMessage.created_datetime,
                },
                {},
            )
        })
    })

    describe('all valid sortable keys', () => {
        it('should handle all sortable keys correctly', () => {
            const sortableKeys = [
                'last_message_datetime',
                'last_received_message_datetime',
                'created_datetime',
            ] as const

            sortableKeys.forEach((key) => {
                jest.clearAllMocks()

                const labelMap = {
                    last_message_datetime: 'Last updated',
                    last_received_message_datetime: 'Last received message',
                    created_datetime: 'Created',
                } as const

                const sortOption: SortOption = {
                    key,
                    order: 'desc',
                    label: labelMap[key],
                } as const

                render(DisplayedDate(sortOption, mockItem))

                // Verify DatetimeLabel was called
                expect(DatetimeLabelMock).toHaveBeenCalled()
            })
        })
    })
})
