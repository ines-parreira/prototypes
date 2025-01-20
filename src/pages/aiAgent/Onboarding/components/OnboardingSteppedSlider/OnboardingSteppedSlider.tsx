import React from 'react'

import {SteppedSlider} from 'pages/common/components/SteppedSlider/SteppedSlider'

const COLOR = '#C34CED'
const BACKGROUND_COLOR = 'var(--accessory-magenta-2)'

export type OnboardingStep = {
    key: string
    label?: string
}

type Props = {
    steps: OnboardingStep[]
    stepKey: string
    onChange: (stepKey: string) => void
}

export const OnboardingSteppedSlider = (props: Props) => {
    const {steps, stepKey, onChange} = props

    return (
        <SteppedSlider
            steps={steps}
            stepKey={stepKey}
            color={COLOR}
            backgroundColor={BACKGROUND_COLOR}
            onChange={onChange}
        />
    )
}
