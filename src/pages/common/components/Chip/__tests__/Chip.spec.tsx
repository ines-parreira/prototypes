import React from 'react'

import { render } from '@testing-library/react'

import { Chip } from '../Chip'

describe('<Chip />', () => {
    it('should display the label', () => {
        const { getByText } = render(
            <Chip id="1" label="label" onClick={jest.fn()} />,
        )

        getByText('label')
    })

    it('should set the aria-pressed when active', () => {
        const { getByRole } = render(
            <Chip id="1" isActive label="label" onClick={jest.fn()} />,
        )

        expect(getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })

    it('should display the check icon when active', () => {
        const { getByAltText } = render(
            <Chip id="1" isActive label="label" onClick={jest.fn()} />,
        )

        getByAltText('checked chip icon')
    })

    it('should not display the check icon when not active', () => {
        const { queryByAltText } = render(
            <Chip id="1" label="label" onClick={jest.fn()} />,
        )

        expect(queryByAltText('checked chip icon')).toBeNull()
    })

    it('should call the onClick callback when clicked', () => {
        const onClick = jest.fn()
        const { getByText } = render(
            <Chip id="1" label="label" onClick={onClick} />,
        )

        getByText('label').click()

        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
