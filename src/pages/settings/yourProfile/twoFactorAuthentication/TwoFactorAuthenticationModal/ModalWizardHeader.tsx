import React, {ComponentProps, useContext, useEffect} from 'react'
import {WizardContext} from 'pages/common/components/wizard/Wizard'
import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'

type OwnProps = {
    currentStep: number
    isUpdate?: boolean
} & ComponentProps<typeof WizardProgressHeader>

export default function ModalWizardHeader({
    currentStep,
    isUpdate,
    labels,
    ...rest
}: OwnProps) {
    const wizardContext = useContext(WizardContext)

    // Update the wizard header when changing step
    useEffect(() => {
        const step = isUpdate ? currentStep : currentStep - 1 // Step 0 is only used for update
        wizardContext?.setActiveStep(Object.keys(labels)[step])
    }, [currentStep, isUpdate, labels, wizardContext])

    return <WizardProgressHeader labels={labels} {...rest} className="mb-4" />
}
