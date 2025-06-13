import { render } from '@testing-library/react'

import { OnboardingStepSelector } from './OnboardingStepSelector'

describe('<OnboardingStepSelector />', () => {
    const steps = [
        { stepName: 'Conversation setup', stepIndicator: 1, isActive: false },
        { stepName: 'Activation', stepIndicator: 2, isActive: true },
    ]
    it('should render steps in correct order', () => {
        const { container } = render(<OnboardingStepSelector steps={steps} />)

        const stepElements = container.getElementsByClassName('step')

        steps.forEach((_, index) => {
            const stepElement = stepElements[index]
            expect(stepElement).toBeInTheDocument()
            expect(
                stepElement.querySelector('.stepIndicator'),
            ).toHaveTextContent((index + 1).toString())
            expect(stepElement.querySelector('.stepName')).toHaveTextContent(
                steps[index].stepName,
            )
        })
    })
    it('should render active step with correct modifier', () => {
        const { container } = render(<OnboardingStepSelector steps={steps} />)

        const activeStepName = container.querySelectorAll('.step--active')
        expect(activeStepName.length).toBe(1)
        expect(activeStepName).not.toBeNull()
        expect(activeStepName[0]?.textContent).toContain('Activation')
    })
})
