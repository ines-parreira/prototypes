import React from 'react'

import { getRGB } from 'gorgias-design-system/utils'
import Button from 'pages/common/components/button/Button'
import ProgressTracker from 'pages/common/components/ProgressTracker/ProgressTracker'

const STEP_TRACKER_COLOR = '--accessory-magenta-25'

type Props = {
    step: number
    totalSteps: number
    onBackClick: () => void
    onNextClick: () => void
    isLoading: boolean
}

const OnboardingProgressTracker = (props: Props) => {
    const { step, totalSteps, onBackClick, onNextClick, isLoading } = props

    const onBackBtnClick = () => {
        // TODO: set step in state here
        onBackClick()
    }

    const onNextBtnClick = () => {
        // TODO: set step in state here
        onNextClick()
    }

    const nextBtnText = step === totalSteps ? 'Finish' : 'Next'

    const color = getRGB(STEP_TRACKER_COLOR)

    const cta = (
        <>
            {step !== 1 && (
                <Button
                    fillStyle="fill"
                    intent="secondary"
                    size="medium"
                    onClick={onBackBtnClick}
                >
                    Back
                </Button>
            )}
            <Button
                fillStyle="fill"
                intent="primary"
                size="medium"
                onClick={onNextBtnClick}
                isLoading={isLoading}
            >
                {nextBtnText}
            </Button>
        </>
    )
    return (
        <ProgressTracker
            step={step}
            totalSteps={totalSteps}
            stepLabel="Step"
            cta={cta}
            stepTrackerColor={color}
        />
    )
}

export default OnboardingProgressTracker
