import { useContext } from 'react'

import { act, render } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import Wizard, { WizardContext } from 'pages/common/components/wizard/Wizard'

import { StepperProgressHeader } from '../StepperProgressHeader'

const MockNextStepComponent = () => {
    const context = useContext(WizardContext)

    if (!context) {
        throw new Error('Component is used outside of Provider')
    }

    return (
        <button
            type="button"
            onClick={() =>
                context.nextStep && context.setActiveStep(context.nextStep)
            }
        >
            Next
        </button>
    )
}

describe('<StepperProgressHeader />', () => {
    const defaultLabels = {
        step1: 'Step 1',
        step2: 'Step 2',
        step3: 'Step 3',
    }

    const defaultSteps = ['step1', 'step2', 'step3']

    it('renders all step labels', () => {
        const { getByText } = render(
            <Wizard startAt="step1" steps={defaultSteps}>
                <StepperProgressHeader labels={defaultLabels} />
            </Wizard>,
        )

        expect(getByText('Step 1')).toBeInTheDocument()
        expect(getByText('Step 2')).toBeInTheDocument()
        expect(getByText('Step 3')).toBeInTheDocument()
    })

    it('renders with custom className', () => {
        const { container } = render(
            <Wizard startAt="step1" steps={defaultSteps}>
                <StepperProgressHeader
                    labels={defaultLabels}
                    className="custom-class"
                />
            </Wizard>,
        )

        expect(container.firstChild).toHaveClass('custom-class')
    })

    it('skips steps without labels', () => {
        const labels = {
            step1: 'Step 1',
            step3: 'Step 3',
        }

        const { queryByText } = render(
            <Wizard startAt="step1" steps={defaultSteps}>
                <StepperProgressHeader labels={labels} />
            </Wizard>,
        )

        expect(queryByText('Step 1')).toBeInTheDocument()
        expect(queryByText('Step 2')).not.toBeInTheDocument()
        expect(queryByText('Step 3')).toBeInTheDocument()
    })

    it('throws an error when used outside WizardContext', () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        expect(() =>
            render(<StepperProgressHeader labels={defaultLabels} />),
        ).toThrow(
            'StepperProgressHeader must be used within a WizardContext.Provider',
        )

        consoleSpy.mockRestore()
    })

    it('displays correct step numbers', () => {
        const { getByLabelText, getByText } = render(
            <Wizard startAt="step2" steps={defaultSteps}>
                <StepperProgressHeader labels={defaultLabels} />
            </Wizard>,
        )

        expect(getByLabelText('check')).toBeInTheDocument()
        expect(getByText('2')).toBeInTheDocument()
        expect(getByText('3')).toBeInTheDocument()
    })

    it('updates step states when navigating to next step', async () => {
        const user = userEvent.setup()

        const { getByRole, getByText, getByLabelText, queryByLabelText } =
            render(
                <Wizard startAt="step1" steps={defaultSteps}>
                    <StepperProgressHeader labels={defaultLabels} />
                    <MockNextStepComponent />
                </Wizard>,
            )

        // Before navigation: step1 is current, step2 and step3 are default
        expect(getByText('Step 1').closest('[data-state]')).toHaveAttribute(
            'data-state',
            'current',
        )
        expect(getByText('Step 2').closest('[data-state]')).toHaveAttribute(
            'data-state',
            'default',
        )
        expect(getByText('Step 3').closest('[data-state]')).toHaveAttribute(
            'data-state',
            'default',
        )
        expect(queryByLabelText('check')).not.toBeInTheDocument()

        await act(() => user.click(getByRole('button', { name: 'Next' })))

        // After navigation: step1 is done, step2 is current, step3 is default
        expect(getByText('Step 1').closest('[data-state]')).toHaveAttribute(
            'data-state',
            'done',
        )
        expect(getByText('Step 2').closest('[data-state]')).toHaveAttribute(
            'data-state',
            'current',
        )
        expect(getByText('Step 3').closest('[data-state]')).toHaveAttribute(
            'data-state',
            'default',
        )
        expect(getByLabelText('check')).toBeInTheDocument()
    })
})
