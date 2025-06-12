import { useState } from 'react'

import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { EnableDiscountField, FollowUpField } from './fields'

import css from './OnboardingCard.less'

const GradientBackground = () => {
    return <div className={css.gradientBackground} />
}

type OnboardingCardProps = {
    currentStep: string
}

export const OnboardingCard = ({ currentStep }: OnboardingCardProps) => {
    const isActivationStep = currentStep === 'Activation'

    const history = useHistory()

    const [isDiscountEnabled, setIsDiscountEnabled] = useState(false)

    const handleDiscountToggle = () => {
        setIsDiscountEnabled((prev) => !prev)
    }

    const [followUpValue, setFollowUpValue] = useState<number>()
    const followUpOptions = [1, 2, 3]

    return (
        <div className={css.onboardingCard}>
            <GradientBackground />
            <div className={css.container}>
                <div style={{ marginBottom: '16px' }}>
                    <span>{currentStep} step</span>
                </div>
                <FollowUpField
                    options={followUpOptions}
                    value={followUpValue}
                    onChange={setFollowUpValue}
                />
                <EnableDiscountField
                    isEnabled={isDiscountEnabled}
                    onChange={handleDiscountToggle}
                />
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
