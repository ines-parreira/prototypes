import { render, screen } from '@testing-library/react'

import { Meta } from 'models/ticket/types'

import { SourceDetailsInfo } from '../SourceDetailsInfo'

jest.mock('pages/common/utils/DatetimeLabel', () =>
    jest.fn(({ dateTime }) => <div>{dateTime}</div>),
)

jest.mock('../SourceDetailsFrom', () => ({
    SourceDetailsFrom: jest.fn(({ label, children }) => (
        <div>
            {label} {children}
        </div>
    )),
}))

describe('SourceDetailsInfo', () => {
    it('renders DatetimeLabel when meta is not duplicated', () => {
        render(<SourceDetailsInfo datetime="2024-01-15T10:30:00Z" />)
        expect(screen.getByText('2024-01-15T10:30:00Z')).toBeInTheDocument()
    })

    it('renders SourceDetailsFrom with link when meta is duplicated', () => {
        const meta: Meta = {
            is_duplicated: true,
            private_reply: {
                original_ticket_id: 'https://example.com/ticket/123',
            },
        }

        render(
            <SourceDetailsInfo datetime="2024-01-15T10:30:00Z" meta={meta} />,
        )

        expect(screen.getByText('go to')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'ticket' })).toBeInTheDocument()
    })
})
