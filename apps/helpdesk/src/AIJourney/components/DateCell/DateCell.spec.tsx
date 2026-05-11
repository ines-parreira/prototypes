import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
// eslint-disable-next-line react-doctor/no-moment
import moment from 'moment-timezone'

import { DateCell } from './DateCell'

describe('DateCell', () => {
    let guessSpy: jest.SpyInstance

    beforeAll(() => {
        guessSpy = jest.spyOn(moment.tz, 'guess').mockReturnValue('UTC')
    })

    afterAll(() => {
        guessSpy.mockRestore()
    })

    it('renders the absolute timestamp when format is absolute', () => {
        render(<DateCell value="2026-06-15T14:23:00Z" format="absolute" />)

        expect(screen.getByText('Jun 15, 2026 2:23 PM')).toBeInTheDocument()
    })

    it('renders a relative timestamp when format is relative', () => {
        const fiveHoursAgo = moment.utc().subtract(5, 'hours').toISOString()

        render(<DateCell value={fiveHoursAgo} format="relative" />)

        expect(screen.getByText(/hours ago/)).toBeInTheDocument()
    })

    it('renders an em dash when value is null', () => {
        render(<DateCell value={null} format="absolute" />)

        expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('renders an em dash when value is undefined', () => {
        render(<DateCell value={undefined} format="relative" />)

        expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('renders an em dash when value is an empty string', () => {
        render(<DateCell value="" format="absolute" />)

        expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('renders an em dash when value is not a parseable date', () => {
        render(<DateCell value="not-a-real-date" format="absolute" />)

        expect(screen.getByText('—')).toBeInTheDocument()
    })
})
