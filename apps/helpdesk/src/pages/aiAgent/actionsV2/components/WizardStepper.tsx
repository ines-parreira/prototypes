import cn from 'classnames'

import css from './WizardStepper.less'

type Step = {
    number: number
    label: string
}

type Props = {
    steps: Step[]
    currentStep: number
    ariaLabel?: string
}

export const WizardStepper = ({
    steps,
    currentStep,
    ariaLabel = 'Progress',
}: Props) => {
    return (
        <ol className={css.stepper} aria-label={ariaLabel}>
            {steps.map((step) => {
                const isCurrent = step.number === currentStep
                return (
                    <li key={step.number} className={css.stepPill}>
                        <span
                            className={cn(css.stepBadge, {
                                [css.stepBadgeCurrent]: isCurrent,
                            })}
                            aria-hidden="true"
                        >
                            {step.number}
                        </span>
                        <span
                            className={cn(css.stepLabel, {
                                [css.stepLabelCurrent]: isCurrent,
                            })}
                            aria-current={isCurrent ? 'step' : undefined}
                        >
                            {step.label}
                        </span>
                    </li>
                )
            })}
        </ol>
    )
}
