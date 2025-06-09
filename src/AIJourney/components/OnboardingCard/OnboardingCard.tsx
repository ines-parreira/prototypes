import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import css from './OnboardingCard.less'

const GradientBackground = () => {
    return <div className={css.gradientBackground} />
}

export const OnboardingCard: React.FC<{
    currentStep: string
}> = ({ currentStep }) => {
    const history = useHistory()

    const isActivationStep = currentStep === 'activation'

    return (
        <div className={css.onboardingCard}>
            <GradientBackground />
            <span>{currentStep} step</span>
            <Button
                onClick={() => history.push('/app/ai-journey/activation')}
                isDisabled={isActivationStep}
            >
                This is a placeholder button
            </Button>
        </div>
    )
}
