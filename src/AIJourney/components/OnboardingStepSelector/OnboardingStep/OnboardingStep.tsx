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
    const stepIndicatorClass = classNames(css.stepIndicator, {
        [css['stepIndicator--active']]: isActive,
    })
    const stepNameClass = classNames(css.stepName, {
        [css['stepName--active']]: isActive,
    })

    return (
        <div className={css.step}>
            <div className={css.stepIndicatorMargin}>
                <div className={stepIndicatorClass}>{stepIndicator}</div>
            </div>
            <span className={stepNameClass}>{stepName}</span>
        </div>
    )
}
