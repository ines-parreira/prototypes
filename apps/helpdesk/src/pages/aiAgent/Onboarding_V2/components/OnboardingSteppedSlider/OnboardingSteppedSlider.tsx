import { getRGB } from 'gorgias-design-system/utils'
import { SteppedSlider } from 'pages/common/components/SteppedSlider/SteppedSlider'

const COLOR = '--accessory-magenta-25'

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
    const { steps, stepKey, onChange } = props

    const color = getRGB(COLOR)

    return (
        <SteppedSlider
            steps={steps}
            stepKey={stepKey}
            color={color}
            onChange={onChange}
        />
    )
}
