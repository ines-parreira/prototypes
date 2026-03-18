import { screen } from '@testing-library/react'

import { useTicketThreadDateTimeFormat } from '../../../../hooks/shared/useTicketThreadDateTimeFormat'
import { render } from '../../../../tests/render.utils'
import { TicketThreadEventDateTime } from '../TicketThreadEventDateTime'

vi.mock('../../../../hooks/shared/useTicketThreadDateTimeFormat', () => ({
    useTicketThreadDateTimeFormat: vi.fn(),
}))

describe('TicketThreadEventDateTime', () => {
    it('formats the event datetime using the agent timezone', () => {
        vi.mocked(useTicketThreadDateTimeFormat).mockReturnValue({
            datetimeFormat: 'YYYY-MM-DD HH:mm',
            compactDateWithTimeFormat: 'YYYY-MM-DD HH:mm',
            timezone: 'America/Los_Angeles',
        })

        render(<TicketThreadEventDateTime datetime="2024-03-21T00:00:00Z" />)

        expect(screen.getByText('2024-03-20 17:00')).toBeInTheDocument()
    })
})
