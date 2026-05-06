import { createContext, useContext } from 'react'

export type SkillWizardContextValue = {
    currentStep: number
    totalSteps: number
    reviewStepsCount: number
    isFirstStep: boolean
    isLastStep: boolean
    isRecapStep: boolean
    goNext: () => void
    goBack: () => void
    goToStep: (step: number) => void
    onTest: () => void
}

export const SkillWizardContext = createContext<SkillWizardContextValue | null>(
    null,
)

export const useSkillWizardContext = (): SkillWizardContextValue => {
    const value = useContext(SkillWizardContext)

    if (value === null) {
        throw new Error(
            'useSkillWizardContext must be used within a SkillWizard',
        )
    }

    return value
}
