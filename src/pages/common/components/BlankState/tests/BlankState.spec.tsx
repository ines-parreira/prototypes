import { render } from '@testing-library/react'

import BlankState from '../BlankState'

describe('<BlankState />', () => {
    it('should display the provided message', () => {
        const message = 'Custom message'
        const { getByText } = render(
            <BlankState message={<div>{message}</div>} />,
        )
        expect(getByText(message)).toBeInTheDocument()
    })
})
