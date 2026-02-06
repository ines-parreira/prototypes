import { SteppedSlider } from 'pages/common/components/SteppedSlider/SteppedSlider'

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

    return (
        <SteppedSlider
            steps={steps}
            stepKey={stepKey}
            color="var(--surface-accent-primary)"
            backgroundColor="var(--surface-neutral-secondary)"
            onChange={onChange}
        />
    )
}
