import { useState } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import { Button, FieldPresentation } from '../'
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
    const { shopName } = useParams<{ shopName: string }>()

    const [followUpValue, setFollowUpValue] = useState<number>()
    const [isDiscountEnabled, setIsDiscountEnabled] = useState(false)
    const [discountValue, setDiscountValue] = useState('')

    const handleDiscountToggle = () => {
        setIsDiscountEnabled((prev) => !prev)
    }

    const handleMaximumDiscountChange = (newValue: string) => {
        setDiscountValue(newValue)
    }
    const followUpOptions = [1, 2, 3]

    const isDiscountFieldValid = isDiscountEnabled ? !!discountValue : true

    const shouldDisableButton = !isDiscountFieldValid || !followUpValue

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
                    label="Continue"
                    onClick={() =>
                        history.push(`/app/ai-journey/${shopName}/activation`)
                    }
                    isDisabled={shouldDisableButton}
                />
            </div>
        </div>
    )
}
