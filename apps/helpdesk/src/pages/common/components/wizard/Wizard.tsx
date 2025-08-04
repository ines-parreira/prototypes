import { createContext, ReactNode, useEffect, useMemo, useState } from 'react'

import { useEffectOnce, useUpdateEffect } from '@repo/hooks'

type Props = {
    children: ReactNode
    startAt?: string
    steps: string[]
    onStepChanged?: (step: string) => void
}

export type WizardContextState = {
    activeStep: string
    activeStepIndex: number
    nextStep: string | undefined
    previousStep: string | undefined
    setActiveStep: (nextStep: string) => void
    totalSteps: number
    steps: string[]
}

export const WizardContext = createContext<WizardContextState | null>(null)

export default function Wizard({
    children,
    steps,
    startAt = steps[0],
    onStepChanged,
}: Props) {
    const [activeStep, setActiveStep] = useState(startAt || '')
    const activeStepIndex = useMemo(
        () => steps.findIndex((step) => activeStep === step),
        [activeStep, steps],
    )

    useEffectOnce(() => {
        if (!steps.includes(startAt)) {
            throw new Error(
                'startAt prop should be included in the initial steps prop array',
            )
        }
    })

    useEffect(() => {
        if (steps.length === 0) {
            throw new Error(
                'steps prop should not be empty, consider conditionally rendering Wizard instead',
            )
        }
    }, [steps])

    useEffect(() => {
        onStepChanged?.(activeStep)
    }, [activeStep, onStepChanged])

    useUpdateEffect(() => {
        if (steps.includes(activeStep)) {
            return
        }
        if (steps.includes(startAt)) {
            setActiveStep(startAt)
        } else {
            setActiveStep(steps[0])
        }
    }, [activeStep, startAt, steps])

    const contextValue = useMemo<WizardContextState>(() => {
        return {
            activeStep,
            activeStepIndex,
            nextStep: steps[activeStepIndex + 1],
            previousStep: steps[activeStepIndex - 1],
            setActiveStep,
            totalSteps: steps.length,
            steps,
        }
    }, [activeStep, activeStepIndex, steps])

    return (
        <WizardContext.Provider value={contextValue}>
            {children}
        </WizardContext.Provider>
    )
}
