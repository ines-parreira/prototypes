import { useContext } from 'react'

import { WizardContext } from '../Wizard'

const useNavigateWizardSteps = () => {
    const wizardContext = useContext(WizardContext)

    return {
        goToPreviousStep: () =>
            wizardContext?.previousStep &&
            wizardContext?.setActiveStep(wizardContext?.previousStep),
        goToNextStep: () =>
            wizardContext?.nextStep &&
            wizardContext?.setActiveStep(wizardContext?.nextStep),
    }
}

export default useNavigateWizardSteps
