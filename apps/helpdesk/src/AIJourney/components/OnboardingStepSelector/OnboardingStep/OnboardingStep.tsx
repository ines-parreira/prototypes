import classNames from 'classnames'

import css from './OnboardingStep.less'

type OnboardingStepProps = {
    stepName: string
    stepIndicator: number
    isActive: boolean
}

export const OnboardingStep = ({
    stepName,
    stepIndicator,
    isActive,
}: OnboardingStepProps) => {
    const stepClass = classNames(css.step, {
        [css['step--active']]: isActive,
    })

    const capitalizedStepName =
        stepName.charAt(0).toUpperCase() + stepName.slice(1)

    return (
        <div className={stepClass}>
            <div className={css.stepIndicatorMargin}>
                <div className={css.stepIndicator}>{stepIndicator}</div>
            </div>
            <span className={css.stepName}>{capitalizedStepName}</span>
        </div>
    )
}
