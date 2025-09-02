import { Icon } from '@gorgias/axiom'

import css from './StaticVerticalStepper.less'

type StaticVerticalStepProps = {
    stepDescription: React.ReactNode
    children: React.ReactNode
}

export function StaticVerticalStep({
    stepDescription,
    children,
}: StaticVerticalStepProps) {
    return (
        <div className={css.stepWrapper}>
            <div className={css.stepIndicator}>
                <Icon name="shape-circle" size={16} />
                <span className={css.stepDescription}>{stepDescription}</span>
            </div>
            <div className={css.stepContent}>{children}</div>
        </div>
    )
}

export function StaticVerticalStepper({
    children,
}: {
    children?: React.ReactNode
}) {
    return <div className={css.stepsContainer}>{children}</div>
}
