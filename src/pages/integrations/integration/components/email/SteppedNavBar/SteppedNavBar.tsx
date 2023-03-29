import classNames from 'classnames'
import React from 'react'

import css from './SteppedNavBar.less'

type Step = {
    name: string
    isComplete: boolean
}

type Props = {
    steps: Step[]
    activeStep: number
}

export default function SteppedNavBar({steps, activeStep}: Props) {
    return (
        <div className={css.container}>
            <div className={css.line} />
            {steps.map((step, index) => {
                const isActive = activeStep === index
                return (
                    <div className={css.stepContainer} key={step.name}>
                        <div
                            className={classNames(css.step, {
                                [css.active]: isActive,
                            })}
                        >
                            {step.isComplete && !isActive ? (
                                <i
                                    className={classNames('material-icons')}
                                    data-testid="check-icon"
                                >
                                    check
                                </i>
                            ) : (
                                <div>{index + 1}</div>
                            )}
                            <div>{step.name}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
