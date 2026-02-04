import { useCallback, useContext, useMemo } from 'react'

import classNames from 'classnames'

import { StepperItem, StepperItemState, StepperList } from '@gorgias/axiom'

import { WizardContext } from 'pages/common/components/wizard/Wizard'

import css from './StepperProgressHeader.less'

type Props = {
    className?: string
    labels: Record<string, string>
}

export const StepperProgressHeader = ({ className, labels }: Props) => {
    const wizardContext = useContext(WizardContext)

    if (wizardContext === null) {
        throw new Error(
            'StepperProgressHeader must be used within a WizardContext.Provider',
        )
    }

    const { steps, activeStepIndex } = wizardContext

    const getStepState = useCallback(
        (index: number): StepperItemState => {
            if (index < activeStepIndex) return StepperItemState.Done
            if (index === activeStepIndex) return StepperItemState.Current
            return StepperItemState.Default
        },
        [activeStepIndex],
    )

    const headerItems = useMemo(() => {
        return steps.map((stepKey, index) => {
            const label = labels[stepKey]
            if (!label) return null

            return (
                <StepperItem
                    key={stepKey}
                    stepNumber={index + 1}
                    label={label}
                    state={getStepState(index)}
                />
            )
        })
    }, [labels, getStepState, steps])

    return (
        <div className={classNames(css.wrapper, className)}>
            <StepperList>{headerItems}</StepperList>
        </div>
    )
}
