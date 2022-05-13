import React, {ReactNode, useContext} from 'react'

import {WizardContext} from './Wizard'

type Props = {
    children?: ReactNode
    name: string
}

export default function WizardStep({children, name}: Props) {
    const wizardContext = useContext(WizardContext)

    if (wizardContext == null) {
        throw new Error(
            'WizardStep must be used within a WizardContext.Provider'
        )
    }

    return <>{wizardContext.activeStep === name ? children : null}</>
}
