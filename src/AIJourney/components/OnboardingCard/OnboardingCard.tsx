import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { FieldPresentation, Info } from '../'

import css from './OnboardingCard.less'

const GradientBackground = () => {
    return <div className={css.gradientBackground} />
}

export const OnboardingCard: React.FC<{
    currentStep: string
}> = ({ currentStep }) => {
    const history = useHistory()

    const isActivationStep = currentStep === 'Activation'

    return (
        <div className={css.onboardingCard}>
            <GradientBackground />
            <div className={css.container}>
                <div style={{ marginBottom: '16px' }}>
                    <span>{currentStep} step</span>
                </div>
                <FieldPresentation
                    name="Field Presentation name"
                    description="Field Presentation description"
                />
                <Info content="I am the info content" />
                <Button
                    onClick={() => history.push('/app/ai-journey/activation')}
                    isDisabled={isActivationStep}
                >
                    This is a placeholder button
                </Button>
            </div>
        </div>
    )
}
