import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import moment from 'moment'

import { DateCell } from './DateCell'

describe('DateCell', () => {
    it('renders the absolute timestamp when format is absolute', () => {
        render(<DateCell value="2026-04-15T14:23:00Z" format="absolute" />)

        expect(screen.getByText(/Apr 15, 2026/)).toBeInTheDocument()
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
})
