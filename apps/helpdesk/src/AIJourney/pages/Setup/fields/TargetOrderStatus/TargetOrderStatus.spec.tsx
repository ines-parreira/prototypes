import { act, render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { TargetOrderStatusField } from './TargetOrderStatus'

describe('TargetOrderStatusField', () => {
    const getSelectedValue = () => {
        const selector = screen.getByRole('group')
        const selectDisplay = selector.querySelector('.dropdownSelect')
        return selectDisplay?.querySelector('.selectedOption')?.textContent
    }

    describe('rendering', () => {
        it('should render with correct field name', () => {
            render(<TargetOrderStatusField />)

            expect(screen.getByText('Trigger event')).toBeInTheDocument()
        })

        it('should render with Order Placed selected by default', () => {
            render(<TargetOrderStatusField />)

            expect(getSelectedValue()).toBe('Order Placed')
        })

        it('should render both options when dropdown is opened', async () => {
            render(<TargetOrderStatusField />)

            const trigger = screen.getByRole('group')
            await act(() => userEvent.click(trigger))

            const listbox = screen.getByRole('listbox')
            expect(
                within(listbox).getByText('Order Placed'),
            ).toBeInTheDocument()
            expect(
                within(listbox).getByText('Order Fulfilled'),
            ).toBeInTheDocument()
        })
    })

    describe('user interactions', () => {
        it('should call onChange with order_placed when Order Placed is selected', async () => {
            const handleChange = jest.fn()
            render(
                <TargetOrderStatusField
                    value="order_fulfilled"
                    onChange={handleChange}
                />,
            )

            const trigger = screen.getByRole('group')
            await act(async () => {
                await userEvent.click(trigger)
                const listbox = screen.getByRole('listbox')
                await userEvent.click(within(listbox).getByText('Order Placed'))
            })

            expect(handleChange).toHaveBeenCalledWith('order_placed')
        })

        it('should call onChange with order_fulfilled when Order Fulfilled is selected', async () => {
            const handleChange = jest.fn()
            render(
                <TargetOrderStatusField
                    value="order_placed"
                    onChange={handleChange}
                />,
            )

            const trigger = screen.getByRole('group')
            await act(async () => {
                await userEvent.click(trigger)
                const listbox = screen.getByRole('listbox')
                await userEvent.click(
                    within(listbox).getByText('Order Fulfilled'),
                )
            })

            expect(handleChange).toHaveBeenCalledWith('order_fulfilled')
        })

        it('should update selected state when value prop changes', () => {
            const { rerender } = render(
                <TargetOrderStatusField value="order_placed" />,
            )

            expect(getSelectedValue()).toBe('Order Placed')

            rerender(<TargetOrderStatusField value="order_fulfilled" />)

            expect(getSelectedValue()).toBe('Order Fulfilled')
        })
    })

    describe('edge cases', () => {
        it('should handle undefined value', () => {
            render(<TargetOrderStatusField value={undefined} />)

            expect(screen.getByText('Trigger event')).toBeInTheDocument()
            expect(getSelectedValue()).toBe('Order Placed')
        })

        it('should handle null value', () => {
            render(<TargetOrderStatusField value={null} />)

            expect(screen.getByText('Trigger event')).toBeInTheDocument()
            expect(getSelectedValue()).toBe('Order Placed')
        })

        it('should not call onChange when it is not provided', async () => {
            render(<TargetOrderStatusField value="order_placed" />)

            const trigger = screen.getByRole('group')
            await act(async () => {
                await userEvent.click(trigger)
                const listbox = screen.getByRole('listbox')
                await userEvent.click(
                    within(listbox).getByText('Order Fulfilled'),
                )
            })

            expect(getSelectedValue()).toBe('Order Fulfilled')
        })
    })
})
