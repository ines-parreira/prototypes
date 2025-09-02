import { render } from '@testing-library/react'

import { OnboardingStepSelector } from './OnboardingStepSelector'

describe('<OnboardingStepSelector />', () => {
    const stepsData = [
        { name: 'Conversation setup', indicator: 1, path: '' },
        { name: 'Activation', indicator: 2, path: '' },
    ]
    const activeStep = 'Activation'

    it('should render steps in correct order', () => {
        const { container } = render(
            <OnboardingStepSelector
                steps={stepsData}
                activeStep={activeStep}
            />,
        )

        const stepElements = container.getElementsByClassName('step')

        stepsData.forEach((step, index) => {
            const stepElement = stepElements[index]
            expect(stepElement).toBeInTheDocument()
            expect(
                stepElement.querySelector('.stepIndicator'),
            ).toHaveTextContent((index + 1).toString())
            expect(stepElement.querySelector('.stepName')).toHaveTextContent(
                step.name,
            )
        })
    })
    it('should render active step with correct modifier', () => {
        const { container } = render(
            <OnboardingStepSelector
                steps={stepsData}
                activeStep="Activation"
            />,
        )
        const activeStepName = container.querySelectorAll('.step--active')
        expect(activeStepName.length).toBe(1)
        expect(activeStepName).not.toBeNull()
        expect(activeStepName[0]?.textContent).toContain('Activation')
    })
})
