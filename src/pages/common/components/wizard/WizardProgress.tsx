import classnames from 'classnames'
import React, {HTMLAttributes, ReactNode, useContext} from 'react'

import {WizardContext} from './Wizard'
import css from './WizardProgress.less'

type Props = {
    children:
        | ReactNode
        | ((activeStepPosition: number, totalSteps: number) => ReactNode)
} & HTMLAttributes<HTMLDivElement>

export default function WizardProgress({children, className, ...other}: Props) {
    const wizardContext = useContext(WizardContext)

    if (wizardContext == null) {
        throw new Error(
            'WizardProgress must be used within a WizardContext.Provider'
        )
    }

    return (
        <div className={classnames(css.wrapper, className)} {...other}>
            {typeof children === 'function'
                ? children(
                      wizardContext.activeStepIndex + 1,
                      wizardContext.totalSteps
                  )
                : children}
        </div>
    )
}
