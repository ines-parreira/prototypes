import { useState } from 'react'

import { useHistory } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { FieldPresentation } from '..'
import {
    EnableDiscountField,
    FollowUpField,
    MaximumDiscountField,
} from './fields'

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
    const [followUpValue, setFollowUpValue] = useState<number>()
    const [discountValue, setDiscountValue] = useState('')

    const handleDiscountToggle = () => {
        setIsDiscountEnabled((prev) => !prev)
    }

    const handleMaximumDiscountChange = (newValue: string) => {
        setDiscountValue(newValue)
    }
    const followUpOptions = [1, 2, 3]

    return (
        <div className={css.onboardingCard}>
            <GradientBackground />
            <div className={css.container}>
                <div style={{ marginBottom: '16px' }}>
                    <span>{currentStep} step</span>
                </div>
                {isActivationStep ? (
                    <FieldPresentation
                        name="Test phone number"
                        description="Select the phone number to preview your campaign"
                    />
                ) : (
                    <>
                        <FollowUpField
                            value={followUpValue}
                            options={followUpOptions}
                            onChange={setFollowUpValue}
                        />
                        <EnableDiscountField
                            isEnabled={isDiscountEnabled}
                            onChange={handleDiscountToggle}
                        />
                        <MaximumDiscountField
                            value={discountValue}
                            isDisabled={!isDiscountEnabled}
                            onChange={handleMaximumDiscountChange}
                        />
                    </>
                )}
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
