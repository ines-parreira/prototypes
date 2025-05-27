import { render } from '@testing-library/react'

import BlankState from '../BlankState'

describe('<BlankState />', () => {
    it('should default with a message', () => {
        const { getByText } = render(<BlankState />)
        expect(getByText(/Enjoy your day/i)).toBeInTheDocument()
    })

    it('should display the provided message', () => {
        const message = 'Custom message'
        const { getByText } = render(
            <BlankState message={<div>{message}</div>} />,
        )
        expect(getByText(message)).toBeInTheDocument()
    })
})
