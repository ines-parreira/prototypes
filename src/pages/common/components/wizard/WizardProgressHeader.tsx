import classnames from 'classnames'
import React, {useContext} from 'react'

import {WizardContext} from './Wizard'

import css from './WizardProgressHeader.less'

type Props = {
    className?: string
    labels: Record<string, string>
}

const WizardProgressHeader: React.FC<Props> = ({className, labels}) => {
    const wizardContext = useContext(WizardContext)

    if (wizardContext === null) {
        throw new Error(
            'WizardProgressHeader must be used within a WizardContext.Provider'
        )
    }

    const {steps, activeStepIndex} = wizardContext

    return (
        <div className={classnames(css.wrapper, className)}>
            {steps.map((step, index) => {
                const isCurrentStep = index === activeStepIndex
                const isPreviousStep = index < activeStepIndex
                const isLastStep = index === steps.length - 1

                if (!labels[step]) {
                    return null
                }

                return (
                    <React.Fragment key={step}>
                        <div
                            className={classnames(css.step, {
                                [css.activeStep]: isCurrentStep,
                                [css.previousStep]: isPreviousStep,
                            })}
                        >
                            <span className={css.stepIndex}>
                                {isPreviousStep ? (
                                    <i className="material-icons">check</i>
                                ) : (
                                    index + 1
                                )}
                            </span>
                            {labels[step]}
                        </div>
                        {!isLastStep && <div className={css.line}></div>}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

export default WizardProgressHeader
