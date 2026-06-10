import { screen, within } from '@testing-library/react'

import { useTicketThreadDateTimeFormat } from '../../../../hooks/shared/useTicketThreadDateTimeFormat'
import { render } from '../../../../tests/render.utils'
import { TicketThreadEventDateTime } from '../TicketThreadEventDateTime'

vi.mock('../../../../hooks/shared/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

describe('TicketThreadEventDateTime', () => {
    it('formats the event datetime using the agent timezone', () => {
        vi.mocked(useTicketThreadDateTimeFormat).mockReturnValue({
            format: {
                relative: 'YYYY-MM-DD HH:mm',
                compact: 'YYYY-MM-DD HH:mm:ss',
            },
            timezone: 'America/Los_Angeles',
        })

        render(<TicketThreadEventDateTime datetime="2024-03-21T00:00:00Z" />)

        expect(screen.getByText('2024-03-20 17:00')).toBeInTheDocument()
    })

    it('renders the compact datetime in the tooltip content', async () => {
        vi.mocked(useTicketThreadDateTimeFormat).mockReturnValue({
            format: {
                relative: 'YYYY-MM-DD',
                compact: 'YYYY-MM-DD HH:mm',
            },
            timezone: 'America/Los_Angeles',
        })

        const { user } = render(
            <TicketThreadEventDateTime datetime="2024-03-21T00:00:00Z" />,
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
