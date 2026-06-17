import { screen, within } from '@testing-library/react'

import { useTicketThreadDateTimeFormat } from '#shared/hooks/useTicketThreadDateTimeFormat'
import { render } from '#tests/render.utils'
import { MessageTimestamp } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageTimestamp'

vi.mock('#shared/hooks/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

describe('MessageTimestamp', () => {
    beforeEach(() => {
        vi.mocked(useTicketThreadDateTimeFormat).mockReturnValue({
            format: {
                relative: 'YYYY-MM-DD',
                compact: 'YYYY-MM-DD HH:mm',
            },
            timezone: 'America/Los_Angeles',
        })
    })

    it('renders the compact datetime in the tooltip content', async () => {
        const { user } = render(
            <MessageTimestamp createdDatetime="2024-03-21T00:00:00Z" />,
        )

        expect(screen.getByText('2024-03-20')).toBeInTheDocument()

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        expect(within(tooltip).getByText('Date:')).toBeInTheDocument()
        expect(
            within(tooltip).getByText('2024-03-20 17:00'),
        ).toBeInTheDocument()
    })
})
