import React, {
    createContext,
    useMemo,
    useState,
    ReactNode,
    useEffect,
} from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
import {useEffectOnce, useUpdateEffect} from 'react-use'

type Props = {
    children: ReactNode
    startAt?: string
    steps: string[]
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

export default function Wizard({children, steps, startAt = steps[0]}: Props) {
    const [activeStep, setActiveStep] = useState(startAt || '')
    const activeStepIndex = useMemo(
        () => steps.findIndex((step) => activeStep === step),
        [activeStep, steps]
    )

    useEffectOnce(() => {
        if (!steps.includes(startAt)) {
            throw new Error(
                'startAt prop should be included in the initial steps prop array'
            )
        }
    })

    useEffect(() => {
        if (steps.length === 0) {
            throw new Error(
                'steps prop should not be empty, consider conditionally rendering Wizard instead'
            )
        }
    }, [steps])

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
