import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { OrderStatusEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES, MAX_WAIT_TIME } from 'AIJourney/constants'

import { MinutesDelay } from './MinutesDelay'

const renderComponent = (
    journeyType?:
        | typeof JOURNEY_TYPES.POST_PURCHASE
        | typeof JOURNEY_TYPES.WELCOME,
    defaultValues: Record<string, unknown> = {},
) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(() => {})}>
                    <MinutesDelay journeyType={journeyType} />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

const renderV3Component = (
    journeyType:
        | typeof JOURNEY_TYPES.POST_PURCHASE
        | typeof JOURNEY_TYPES.WELCOME = JOURNEY_TYPES.POST_PURCHASE,
    defaultValues: Record<string, unknown> = {},
    onSubmit: (data: unknown) => void = () => {},
) => {
    const Wrapper = () => {
        const methods = useForm({
            defaultValues: {
                target_order_status: OrderStatusEnum.OrderPlaced,
                post_purchase_wait_minutes: 30,
                wait_time_minutes: 60,
                ...defaultValues,
            },
        })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <MinutesDelay journeyType={journeyType} isV3Architecture />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

describe('<MinutesDelay />', () => {
    it('should render label and trailing unit', () => {
        renderComponent()

        expect(
            screen.getByText('Delay before first message'),
        ).toBeInTheDocument()
        expect(screen.getByText('min')).toBeInTheDocument()
    })

    it('should render post-purchase caption by default', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Minutes to wait after the order event before messaging.',
            ),
        ).toBeInTheDocument()
    })

    it('should render post-purchase caption when journeyType is POST_PURCHASE', () => {
        renderComponent(JOURNEY_TYPES.POST_PURCHASE)

        expect(
            screen.getByText(
                'Minutes to wait after the order event before messaging.',
            ),
        ).toBeInTheDocument()
    })

    it('should render welcome caption when journeyType is WELCOME', () => {
        renderComponent(JOURNEY_TYPES.WELCOME)

        expect(
            screen.getByText(
                'Minutes to wait after the SMS consent event before messaging.',
            ),
        ).toBeInTheDocument()
    })

    it('should show validation error when input value exceeds MAX_WAIT_TIME for post-purchase', async () => {
        const user = userEvent.setup()
        renderComponent(JOURNEY_TYPES.POST_PURCHASE)

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /submit/i })

        await user.type(input, String(MAX_WAIT_TIME + 1))
        await user.click(submitButton)

        await waitFor(() => {
            expect(
                screen.getByText(
                    `Please enter wait time between 0 and ${MAX_WAIT_TIME} minutes (7 days)`,
                ),
            ).toBeInTheDocument()
        })
    })

    it('should show validation error when input value exceeds MAX_WAIT_TIME for welcome', async () => {
        const user = userEvent.setup()
        renderComponent(JOURNEY_TYPES.WELCOME)

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /submit/i })

        await user.type(input, String(MAX_WAIT_TIME + 1))
        await user.click(submitButton)

        await waitFor(() => {
            expect(
                screen.getByText(
                    `Please enter wait time between 0 and ${MAX_WAIT_TIME} minutes (7 days)`,
                ),
            ).toBeInTheDocument()
        })
    })

    it('should not show validation error when input value is within range', async () => {
        const user = userEvent.setup()
        renderComponent()

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /submit/i })

        await user.type(input, String(50))
        await user.click(submitButton)

        await waitFor(() => {
            expect(
                screen.queryByText(
                    `Please enter wait time between 0 and ${MAX_WAIT_TIME} minutes (7 days)`,
                ),
            ).not.toBeInTheDocument()
        })
    })

    it('should pre-populate the field with default value for post-purchase', () => {
        renderComponent(JOURNEY_TYPES.POST_PURCHASE, {
            post_purchase_wait_minutes: 30,
        })

        expect(screen.getByRole('textbox')).toHaveValue('30')
    })

    it('should pre-populate the field with default value for welcome', () => {
        renderComponent(JOURNEY_TYPES.WELCOME, { wait_time_minutes: 15 })

        expect(screen.getByRole('textbox')).toHaveValue('15')
    })
})

describe('<MinutesDelay /> with isV3Architecture', () => {
    it('should render the "Send delay" NumberField', () => {
        renderV3Component()

        expect(
            screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
        ).toBeInTheDocument()
    })

    it('should render the unit selector', () => {
        renderV3Component(JOURNEY_TYPES.POST_PURCHASE, {
            target_order_status: OrderStatusEnum.OrderPlaced,
            post_purchase_wait_minutes: 30,
        })

        expect(
            screen.getByLabelText(/send delay unit/i, { selector: 'button' }),
        ).toBeInTheDocument()
    })

    it('should display the value 30 with "min" unit when delay is 30 minutes', () => {
        renderV3Component(JOURNEY_TYPES.POST_PURCHASE, {
            target_order_status: OrderStatusEnum.OrderPlaced,
            post_purchase_wait_minutes: 30,
        })

        expect(
            screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
        ).toHaveValue('30')
        expect(
            screen.getByLabelText(/send delay unit/i, { selector: 'input' }),
        ).toHaveValue('min')
    })

    it('should display the value 1 with "hr" unit when delay is 60 minutes', () => {
        renderV3Component(JOURNEY_TYPES.POST_PURCHASE, {
            target_order_status: OrderStatusEnum.OrderFulfilled,
            post_purchase_wait_minutes: 60,
        })

        expect(
            screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
        ).toHaveValue('1')
        expect(
            screen.getByLabelText(/send delay unit/i, { selector: 'input' }),
        ).toHaveValue('hr')
    })

    it('should display the value 4 with "hr" unit when delay is 240 minutes', () => {
        renderV3Component(JOURNEY_TYPES.POST_PURCHASE, {
            target_order_status: OrderStatusEnum.OrderFulfilled,
            post_purchase_wait_minutes: 240,
        })

        expect(
            screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
        ).toHaveValue('4')
        expect(
            screen.getByLabelText(/send delay unit/i, { selector: 'input' }),
        ).toHaveValue('hr')
    })

    it('should fall back to "min" for non-divisible legacy values like 7', () => {
        renderV3Component(JOURNEY_TYPES.WELCOME, {
            wait_time_minutes: 7,
        })

        expect(
            screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
        ).toHaveValue('7')
        expect(
            screen.getByLabelText(/send delay unit/i, { selector: 'input' }),
        ).toHaveValue('min')
    })

    it('should let user type a custom value', async () => {
        const onSubmit = jest.fn()
        const user = userEvent.setup()

        renderV3Component(
            JOURNEY_TYPES.POST_PURCHASE,
            {
                target_order_status: OrderStatusEnum.OrderPlaced,
                post_purchase_wait_minutes: 30,
            },
            onSubmit,
        )

        const input = screen.getByLabelText(/^send delay$/i, {
            selector: 'input',
        })
        await user.clear(input)
        await user.type(input, '45')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    post_purchase_wait_minutes: 45,
                }),
                expect.anything(),
            )
        })
    })

    it('should keep the displayed value and recompute base value when switching unit', async () => {
        const onSubmit = jest.fn()
        const user = userEvent.setup()

        renderV3Component(
            JOURNEY_TYPES.POST_PURCHASE,
            {
                target_order_status: OrderStatusEnum.OrderPlaced,
                post_purchase_wait_minutes: 30,
            },
            onSubmit,
        )

        await user.click(
            screen.getByLabelText(/send delay unit/i, { selector: 'button' }),
        )
        await user.click(await screen.findByRole('option', { name: 'hr' }))

        expect(
            screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
        ).toHaveValue('30')

        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    post_purchase_wait_minutes: 1800,
                }),
                expect.anything(),
            )
        })
    })

    it('should preserve a saved post_purchase_wait_minutes when the form reset arrives after mount', async () => {
        const onSubmit = jest.fn()

        const Wrapper = () => {
            const methods = useForm<{
                target_order_status?: OrderStatusEnum
                post_purchase_wait_minutes?: number
            }>({
                defaultValues: {
                    target_order_status: undefined,
                    post_purchase_wait_minutes: undefined,
                },
            })

            return (
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <MinutesDelay
                            journeyType={JOURNEY_TYPES.POST_PURCHASE}
                            isV3Architecture
                        />
                        <button
                            type="button"
                            onClick={() =>
                                methods.reset({
                                    target_order_status:
                                        OrderStatusEnum.OrderFulfilled,
                                    post_purchase_wait_minutes: 1440,
                                })
                            }
                        >
                            Apply server data
                        </button>
                        <button type="submit">Submit</button>
                    </form>
                </FormProvider>
            )
        }

        render(<Wrapper />)

        const user = userEvent.setup()

        await user.click(
            screen.getByRole('button', { name: /apply server data/i }),
        )

        await waitFor(() => {
            expect(
                screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
            ).toHaveValue('1')
        })
        expect(
            screen.getByLabelText(/send delay unit/i, { selector: 'input' }),
        ).toHaveValue('days')

        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    post_purchase_wait_minutes: 1440,
                }),
                expect.anything(),
            )
        })
    })

    it('should reset post_purchase_wait_minutes to the default when the user switches between two defined statuses', async () => {
        const onSubmit = jest.fn()

        const Wrapper = () => {
            const methods = useForm<{
                target_order_status: OrderStatusEnum
                post_purchase_wait_minutes: number
            }>({
                defaultValues: {
                    target_order_status: OrderStatusEnum.OrderFulfilled,
                    post_purchase_wait_minutes: 1440,
                },
            })

            return (
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <MinutesDelay
                            journeyType={JOURNEY_TYPES.POST_PURCHASE}
                            isV3Architecture
                        />
                        <button
                            type="button"
                            onClick={() =>
                                methods.setValue(
                                    'target_order_status',
                                    OrderStatusEnum.OrderPlaced,
                                )
                            }
                        >
                            Switch to OrderPlaced
                        </button>
                        <button type="submit">Submit</button>
                    </form>
                </FormProvider>
            )
        }

        render(<Wrapper />)

        const user = userEvent.setup()

        await user.click(
            screen.getByRole('button', { name: /switch to orderplaced/i }),
        )

        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    target_order_status: OrderStatusEnum.OrderPlaced,
                    post_purchase_wait_minutes: 30,
                }),
                expect.anything(),
            )
        })
    })

    it('should seed the default post_purchase_wait_minutes when the user picks a status on a brand-new flow (no saved value)', async () => {
        const onSubmit = jest.fn()

        const Wrapper = () => {
            const methods = useForm<{
                target_order_status?: OrderStatusEnum
                post_purchase_wait_minutes?: number
            }>({
                defaultValues: {
                    target_order_status: undefined,
                    post_purchase_wait_minutes: undefined,
                },
            })

            return (
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)}>
                        <MinutesDelay
                            journeyType={JOURNEY_TYPES.POST_PURCHASE}
                            isV3Architecture
                        />
                        <button
                            type="button"
                            onClick={() =>
                                methods.setValue(
                                    'target_order_status',
                                    OrderStatusEnum.OrderPlaced,
                                )
                            }
                        >
                            Pick OrderPlaced
                        </button>
                        <button type="submit">Submit</button>
                    </form>
                </FormProvider>
            )
        }

        render(<Wrapper />)

        const user = userEvent.setup()

        await user.click(
            screen.getByRole('button', { name: /pick orderplaced/i }),
        )

        await waitFor(() => {
            expect(
                screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
            ).toHaveValue('30')
        })

        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    target_order_status: OrderStatusEnum.OrderPlaced,
                    post_purchase_wait_minutes: 30,
                }),
                expect.anything(),
            )
        })
    })
})

describe('<MinutesDelay /> with isV3Architecture - Welcome flow', () => {
    const renderV3WelcomeComponent = (
        defaultValues: Record<string, unknown> = {},
    ) => {
        const Wrapper = () => {
            const methods = useForm({ defaultValues })
            return (
                <FormProvider {...methods}>
                    <form>
                        <MinutesDelay
                            journeyType={JOURNEY_TYPES.WELCOME}
                            isV3Architecture
                        />
                    </form>
                </FormProvider>
            )
        }
        return render(<Wrapper />)
    }

    it('should default to 5 minutes when no value is provided', async () => {
        renderV3WelcomeComponent()

        await waitFor(() => {
            expect(
                screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
            ).toHaveValue('5')
        })
        expect(
            screen.getByLabelText(/send delay unit/i, { selector: 'input' }),
        ).toHaveValue('min')
    })

    it('should display 15 with "min" unit when delay is 15 minutes', () => {
        renderV3WelcomeComponent({ wait_time_minutes: 15 })

        expect(
            screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
        ).toHaveValue('15')
        expect(
            screen.getByLabelText(/send delay unit/i, { selector: 'input' }),
        ).toHaveValue('min')
    })

    it('should display 1 with "hr" unit when delay is 60 minutes', () => {
        renderV3WelcomeComponent({ wait_time_minutes: 60 })

        expect(
            screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
        ).toHaveValue('1')
        expect(
            screen.getByLabelText(/send delay unit/i, { selector: 'input' }),
        ).toHaveValue('hr')
    })

    it('should display 1 with "days" unit when delay is 1440 minutes', () => {
        renderV3WelcomeComponent({ wait_time_minutes: 1440 })

        expect(
            screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
        ).toHaveValue('1')
        expect(
            screen.getByLabelText(/send delay unit/i, { selector: 'input' }),
        ).toHaveValue('days')
    })

    it('should preserve a non-hour-aligned legacy value in minutes', () => {
        renderV3WelcomeComponent({ wait_time_minutes: 7 })

        expect(
            screen.getByLabelText(/^send delay$/i, { selector: 'input' }),
        ).toHaveValue('7')
        expect(
            screen.getByLabelText(/send delay unit/i, { selector: 'input' }),
        ).toHaveValue('min')
    })
})
