import React, { ComponentProps } from 'react'

import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import NewToggleField from '../NewToggleField'

const renderComponent = (
    props: Partial<ComponentProps<typeof NewToggleField>> = {},
) => {
    const defaultProps = {
        value: false,
        onChange: jest.fn(),
    }
    const { container, getByRole, getByText, queryByText } = render(
        <NewToggleField {...defaultProps} {...props} />,
    )
    return { container, getByRole, getByText, queryByText }
}

describe('<NewToggleField />', () => {
    it('should render the toggle field with label', () => {
        const { getByText, getByRole } = renderComponent({
            label: 'Test Label',
        })

        expect(getByText('Test Label')).toBeInTheDocument()
        expect(getByRole('switch')).toBeInTheDocument()
    })

    it.each([true, false])(
        'should call onChange when toggle is clicked',
        (value) => {
            const onChangeMock = jest.fn()
            const { getByRole } = renderComponent({
                value,
                onChange: onChangeMock,
            })

            act(() => {
                userEvent.click(getByRole('switch'))
            })
            waitFor(() => {
                expect(onChangeMock).toHaveBeenCalledTimes(1)
                expect(onChangeMock).toHaveBeenCalledWith(!value)
            })
        },
    )

    it('should reflect the checked state', () => {
        const { getByRole } = renderComponent({ value: true })
        const switchElement = getByRole('switch')

        expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('should reflect the unchecked state', () => {
        const { getByRole } = renderComponent({ value: false })
        const switchElement = getByRole('switch')

        expect(switchElement).toHaveAttribute('aria-checked', 'false')
    })

    it('should handle disabled state', () => {
        const onChangeMock = jest.fn()
        const { getByRole } = renderComponent({
            isDisabled: true,
            onChange: onChangeMock,
        })

        const switchElement = getByRole('switch')
        expect(switchElement).toHaveClass('disabled')

        act(() => {
            userEvent.click(switchElement)
        })
        waitFor(() => expect(onChangeMock).toHaveBeenCalledTimes(1))
    })
})
