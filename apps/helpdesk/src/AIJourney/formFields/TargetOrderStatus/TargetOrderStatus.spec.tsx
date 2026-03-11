import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { OrderStatusEnum } from '@gorgias/convert-client'

import { TargetOrderStatus } from './TargetOrderStatus'

const renderComponent = async (
    defaultValues: Record<string, unknown> = {
        target_order_status: OrderStatusEnum.OrderPlaced,
    },
    onSubmit: jest.Mock = jest.fn(),
) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <TargetOrderStatus />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    await act(async () => {
        render(<Wrapper />)
    })
    return { onSubmit }
}

beforeAll(() => {
    HTMLElement.prototype.getAnimations = jest.fn().mockReturnValue([])
})

describe('<TargetOrderStatus />', () => {
    it('should render the label and both order status options', async () => {
        await renderComponent()

        expect(screen.getByText('Start this flow when')).toBeInTheDocument()
        expect(screen.getByText('Order placed')).toBeInTheDocument()
        expect(screen.getByText('Order fulfilled')).toBeInTheDocument()
    })

    it('should submit with Order placed value by default', async () => {
        const { onSubmit } = await renderComponent({
            target_order_status: OrderStatusEnum.OrderPlaced,
        })
        const user = userEvent.setup()

        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                target_order_status: OrderStatusEnum.OrderPlaced,
            }),
            expect.anything(),
        )
    })

    it('should submit with Order fulfilled value when that option is selected', async () => {
        const { onSubmit } = await renderComponent({
            target_order_status: OrderStatusEnum.OrderFulfilled,
        })
        const user = userEvent.setup()

        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                target_order_status: OrderStatusEnum.OrderFulfilled,
            }),
            expect.anything(),
        )
    })

    it('should update form value when Order fulfilled is clicked', async () => {
        const { onSubmit } = await renderComponent({
            target_order_status: OrderStatusEnum.OrderPlaced,
        })
        const user = userEvent.setup()

        await user.click(screen.getByText('Order fulfilled'))
        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                target_order_status: OrderStatusEnum.OrderFulfilled,
            }),
            expect.anything(),
        )
    })
})
