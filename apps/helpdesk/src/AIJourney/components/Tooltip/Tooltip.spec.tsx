import { render, screen } from '@testing-library/react'

import { Tooltip } from './Tooltip'

describe('<Tooltip />', () => {
    it('renders the date and info', () => {
        render(<Tooltip date="Jun 26th - Jun 31st" info="15%" />)
        expect(screen.getByText('Jun 26th - Jun 31st')).toBeInTheDocument()
        expect(screen.getByText('15%')).toBeInTheDocument()
    })
})
