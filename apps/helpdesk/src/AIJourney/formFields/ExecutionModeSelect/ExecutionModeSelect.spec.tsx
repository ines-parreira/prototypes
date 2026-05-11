import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import type { JourneyParticipationExecutionMode } from '@gorgias/convert-client'

import { ExecutionModeSelect } from './ExecutionModeSelect'

type FormValues = {
    execution_mode_override: JourneyParticipationExecutionMode | null
}

type ProbeProps = {
    showDefaultOption?: boolean
    initialValue?: JourneyParticipationExecutionMode | null
    storeFallbackMode?: JourneyParticipationExecutionMode | null
    defaultOptionLabel?: string
    defaultOptionDescription?: string
    ariaLabel?: string
    onSubmit?: (values: FormValues) => void
}

const Probe = ({
    showDefaultOption = true,
    initialValue = null,
    storeFallbackMode,
    defaultOptionLabel,
    defaultOptionDescription,
    ariaLabel,
    onSubmit = () => {},
}: ProbeProps) => {
    const methods = useForm<FormValues>({
        defaultValues: { execution_mode_override: initialValue },
    })
    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
                <ExecutionModeSelect
                    name="execution_mode_override"
                    showDefaultOption={showDefaultOption}
                    storeFallbackMode={storeFallbackMode}
                    defaultOptionLabel={defaultOptionLabel}
                    defaultOptionDescription={defaultOptionDescription}
                    ariaLabel={ariaLabel}
                />
                <button type="submit">submit</button>
            </form>
        </FormProvider>
    )
}

describe('<ExecutionModeSelect />', () => {
    it('selecting a mode sets the form value to that mode', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        render(<Probe onSubmit={onSubmit} />)

        await user.click(screen.getByLabelText(/Trial/i))
        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ execution_mode_override: 'trial' }),
            expect.anything(),
        )
    })

    it('selecting "Use store default" clears the override to null', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        render(<Probe initialValue="regular" onSubmit={onSubmit} />)

        await user.click(screen.getByLabelText(/Use store default/i))
        await user.click(screen.getByRole('button', { name: /submit/i }))

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ execution_mode_override: null }),
            expect.anything(),
        )
    })

    it('hides the default option when showDefaultOption is false', () => {
        render(<Probe showDefaultOption={false} />)

        expect(
            screen.queryByLabelText(/Use store default/i),
        ).not.toBeInTheDocument()
        expect(screen.getByLabelText(/Dry run/i)).toBeInTheDocument()
    })

    it('honors a custom default option label and description', () => {
        render(
            <Probe
                defaultOptionLabel="No override"
                defaultOptionDescription="Falls back to Dry run."
            />,
        )

        expect(screen.getByLabelText(/No override/i)).toBeInTheDocument()
        expect(screen.getByText('Falls back to Dry run.')).toBeInTheDocument()
    })

    it('uses the resolved store fallback mode in the default option description', () => {
        render(<Probe storeFallbackMode="trial" />)

        expect(
            screen.getByText(/Falls back to: Trial \(store default\)/i),
        ).toBeInTheDocument()
    })

    it('uses the provided ariaLabel on the radio group', () => {
        render(<Probe ariaLabel="Store-level execution mode" />)

        expect(
            screen.getByRole('radiogroup', {
                name: /Store-level execution mode/i,
            }),
        ).toBeInTheDocument()
    })

    it('renders pre-selected value when the form has an initial mode', () => {
        render(<Probe initialValue="regular" />)

        const regular = screen.getByLabelText(/Regular/i) as HTMLInputElement
        expect(regular.checked).toBe(true)
    })
})
