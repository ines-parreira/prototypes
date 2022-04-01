import React from 'react'
import {fireEvent, render, waitFor} from '@testing-library/react'

import {ActionButton} from '../ActionButton'

describe('<ActionButton />', () => {
    it('matches default snapshot', () => {
        const {container} = render(<ActionButton>Action</ActionButton>)
        expect(container).toMatchSnapshot()
    })

    it('applies the correct variant class', () => {
        const {getByText, rerender} = render(
            <ActionButton variant="danger">Delete</ActionButton>
        )

        const btn = getByText('Delete')

        expect(btn.classList.contains('destructive')).toBe(true)

        rerender(<ActionButton variant="neutral">Delete</ActionButton>)

        expect(btn.classList.contains('secondary')).toBe(true)
    })

    it('shows the tooltip on hover', async () => {
        const {getByText} = render(
            <ActionButton help="help me!">Show help</ActionButton>
        )

        fireEvent.mouseOver(getByText('Show help'))

        await waitFor(() => getByText('help me!'))
    })
})
