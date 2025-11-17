import type { ComponentProps } from 'react'
import React from 'react'

import { fireEvent, render } from '@testing-library/react'

import { NewToggleButton } from '../NewToggleButton'

const renderComponent = (
    props: Partial<ComponentProps<typeof NewToggleButton>> = {},
) => {
    const defaultProps = {
        checked: false,
        onChange: jest.fn(),
        isDisabled: false,
    }
    const { container, getByRole } = render(
        <NewToggleButton {...defaultProps} {...props} />,
    )
    return { container, getByRole }
}

describe('<NewToggleButton />', () => {
    it('should render the toggle button', () => {
        const { getByRole } = renderComponent()

        expect(getByRole('checkbox')).toBeInTheDocument()
    })

    it('should call onChange when clicked', () => {
        const onChangeMock = jest.fn()
        const { getByRole } = renderComponent({ onChange: onChangeMock })

        fireEvent.click(getByRole('checkbox'))
        expect(onChangeMock).toHaveBeenCalledTimes(1)
        expect(onChangeMock).toHaveBeenCalledWith(true)
    })

    it('should apply the correct class when checked', () => {
        const { container } = renderComponent({ checked: true })

        expect(container.firstChild).toHaveClass('checked')
    })

    it('should apply the correct class when disabled', () => {
        const { container } = renderComponent({ isDisabled: true })

        expect(container.firstChild).toHaveClass('disabled')
    })
})
