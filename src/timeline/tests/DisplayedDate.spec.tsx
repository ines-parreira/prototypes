import { render, screen } from '@testing-library/react'

import { TicketCompact } from '@gorgias/api-types'

import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import DisplayedDate from '../DisplayedDate'
import { SortOption } from '../types'

jest.mock('pages/common/utils/DatetimeLabel', () => {
    return jest.fn(() => <div>Mocked DatetimeLabel</div>)
})

describe('DisplayedDate', () => {
    const mockTicket = {
        id: 1,
        created_datetime: '2021-01-01T00:00:00Z',
        last_message_datetime: '2021-01-02T00:00:00Z',
    } as TicketCompact

    it('should render label and date', () => {
        const sortOption: SortOption = {
            key: 'created_datetime',
            order: 'asc',
            label: 'Created',
        }
        render(DisplayedDate(sortOption, mockTicket))

        expect(screen.getByText(/Created/)).toBeInTheDocument()
        expect(screen.getByText('Mocked DatetimeLabel')).toBeInTheDocument()
    })

    it('should use fallback date when sort key is not present', () => {
        const sortOption: SortOption = {
            key: 'last_received_message_datetime',
            order: 'asc',
            label: 'Last received message',
        }
        render(DisplayedDate(sortOption, mockTicket))

        expect(DatetimeLabel).toHaveBeenCalledWith(
            {
                dateTime: mockTicket.created_datetime,
            },
            {},
        )
    })

    it('should not display created_datetime label when key is different', () => {
        const sortOption: SortOption = {
            key: 'last_message_datetime',
            order: 'asc',
            label: 'Last message',
        }
        const { queryByText } = render(DisplayedDate(sortOption, mockTicket))

        expect(queryByText(/Created/)).not.toBeInTheDocument()

        expect(DatetimeLabel).toHaveBeenCalledWith(
            {
                dateTime: mockTicket.last_message_datetime,
            },
            {},
        )
    })
})
