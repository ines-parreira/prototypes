import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { ValueWithUnitField } from './ValueWithUnitField'
import type { UnitOption } from './ValueWithUnitField'

const MINUTES_HOURS_UNITS: UnitOption[] = [
    { id: 'minutes', label: 'min', factorToBase: 1 },
    { id: 'hours', label: 'hr', factorToBase: 60 },
]

const DAYS_UNIT: UnitOption[] = [{ id: 'days', label: 'days', factorToBase: 1 }]

const renderWithForm = ({
    units,
    defaultValues = {},
    isUnitDisabled,
    isDisabled,
    minBaseValue,
    maxBaseValue,
    caption,
    unitAriaLabel = 'Send delay unit',
    onSubmit = () => {},
}: {
    units: UnitOption[]
    defaultValues?: Record<string, unknown>
    isUnitDisabled?: boolean
    isDisabled?: boolean
    minBaseValue?: number
    maxBaseValue?: number
    caption?: string
    unitAriaLabel?: string
    onSubmit?: (data: unknown) => void
}) => {
    const Wrapper = () => {
        const methods = useForm({ defaultValues })
        return (
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <ValueWithUnitField
                        fieldName="delay"
                        label="Send delay"
                        units={units}
                        isUnitDisabled={isUnitDisabled}
                        isDisabled={isDisabled}
                        minBaseValue={minBaseValue}
                        maxBaseValue={maxBaseValue}
                        caption={caption}
                        unitAriaLabel={unitAriaLabel}
                    />
                    <button type="submit">Submit</button>
                </form>
            </FormProvider>
        )
    }
    return render(<Wrapper />)
}

const getValueInput = () =>
    screen.getByLabelText(/^send delay$/i, { selector: 'input' })
const getUnitTrigger = () =>
    screen.getByLabelText(/send delay unit/i, { selector: 'button' })
const getUnitDisplay = () =>
    screen.getByLabelText(/send delay unit/i, { selector: 'input' })

describe('<ValueWithUnitField />', () => {
    it('should render the visible label, the value input and the unit selector', () => {
        renderWithForm({
            units: MINUTES_HOURS_UNITS,
            defaultValues: { delay: 30 },
        })

        expect(screen.getByText('Send delay')).toBeInTheDocument()
        expect(getValueInput()).toBeInTheDocument()
        expect(getUnitTrigger()).toBeInTheDocument()
    })

    it('should pick the largest unit where the value is a whole number', () => {
        renderWithForm({
            units: MINUTES_HOURS_UNITS,
            defaultValues: { delay: 120 },
        })

        expect(getValueInput()).toHaveValue('2')
        expect(getUnitDisplay()).toHaveValue('hr')
    })

    it('should fall back to the smallest unit when the value is not divisible', () => {
        renderWithForm({
            units: MINUTES_HOURS_UNITS,
            defaultValues: { delay: 7 },
        })

        expect(getValueInput()).toHaveValue('7')
        expect(getUnitDisplay()).toHaveValue('min')
    })

    it('should store the value multiplied by the unit factor when user types', async () => {
        const onSubmit = jest.fn()
        const user = userEvent.setup()

        renderWithForm({
            units: MINUTES_HOURS_UNITS,
            defaultValues: { delay: 60 },
            onSubmit,
        })

        await user.clear(getValueInput())
        await user.type(getValueInput(), '3')
        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ delay: 180 }),
                expect.anything(),
            )
        })
    })

    it('should keep displayed value and recompute base value when switching unit', async () => {
        const onSubmit = jest.fn()
        const user = userEvent.setup()

        renderWithForm({
            units: MINUTES_HOURS_UNITS,
            defaultValues: { delay: 30 },
            onSubmit,
        })

        await user.click(getUnitTrigger())
        await user.click(await screen.findByRole('option', { name: 'hr' }))

        expect(getValueInput()).toHaveValue('30')

        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ delay: 1800 }),
                expect.anything(),
            )
        })
    })

    it('should render the unit selector as disabled when isUnitDisabled is true', () => {
        renderWithForm({
            units: DAYS_UNIT,
            defaultValues: { delay: 30 },
            isUnitDisabled: true,
            unitAriaLabel: 'Days unit',
        })

        const trigger = screen.getByLabelText(/days unit/i, {
            selector: 'button',
        })
        expect(trigger).toBeDisabled()
        expect(
            screen.getByLabelText(/days unit/i, { selector: 'input' }),
        ).toHaveValue('days')
    })

    it('should re-pick the best unit when value transitions from null to a defined value', async () => {
        const Wrapper = () => {
            const methods = useForm<{ delay?: number }>({
                defaultValues: { delay: undefined },
            })

            return (
                <FormProvider {...methods}>
                    <form>
                        <ValueWithUnitField
                            fieldName="delay"
                            label="Send delay"
                            units={MINUTES_HOURS_UNITS}
                            unitAriaLabel="Send delay unit"
                        />
                        <button
                            type="button"
                            onClick={() => methods.reset({ delay: 1440 })}
                        >
                            Apply server data
                        </button>
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
            expect(getValueInput()).toHaveValue('24')
        })
        expect(getUnitDisplay()).toHaveValue('hr')
    })

    it('should render the caption when provided', () => {
        renderWithForm({
            units: MINUTES_HOURS_UNITS,
            defaultValues: { delay: 30 },
            caption: 'Some helpful caption',
        })

        expect(screen.getByText('Some helpful caption')).toBeInTheDocument()
    })

    it('should not render a caption when none is provided', () => {
        renderWithForm({
            units: MINUTES_HOURS_UNITS,
            defaultValues: { delay: 30 },
        })

        expect(
            screen.queryByText('Some helpful caption'),
        ).not.toBeInTheDocument()
    })

    it('should disable both the value input and the unit selector when isDisabled is true', () => {
        renderWithForm({
            units: MINUTES_HOURS_UNITS,
            defaultValues: { delay: 30 },
            isDisabled: true,
        })

        expect(getValueInput()).toBeDisabled()
        expect(getUnitTrigger()).toBeDisabled()
    })

    it('should auto-fill with minBaseValue when input is cleared (current unit fits)', async () => {
        const onSubmit = jest.fn()
        const user = userEvent.setup()

        renderWithForm({
            units: MINUTES_HOURS_UNITS,
            defaultValues: { delay: 60 },
            minBaseValue: 0,
            onSubmit,
        })

        await user.clear(getValueInput())
        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ delay: 0 }),
                expect.anything(),
            )
        })
    })

    it('should store minBaseValue when clearing input on a unit that does not fit minBaseValue', async () => {
        const onSubmit = jest.fn()
        const user = userEvent.setup()
        const units: UnitOption[] = [
            { id: 'hours', label: 'hr', factorToBase: 60 },
            { id: 'days', label: 'days', factorToBase: 60 * 24 },
        ]

        renderWithForm({
            units,
            defaultValues: { delay: 1440 },
            minBaseValue: 60,
            onSubmit,
        })

        expect(getUnitDisplay()).toHaveValue('days')

        await user.clear(getValueInput())
        await user.click(screen.getByRole('button', { name: /submit/i }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({ delay: 60 }),
                expect.anything(),
            )
        })
    })
})
