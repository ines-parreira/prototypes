import React, {ReactNode, createContext} from 'react'

import {
    WizardConfiguration,
    WizardStepConfiguration,
} from 'pages/convert/campaigns/types/CampaignFormConfiguration'

export interface CampaignFormConfigurationType {
    isEditMode: boolean
    configuration?: WizardConfiguration
    getStepConfiguration: (step: string) => WizardStepConfiguration | undefined
}

export const CampaignFormConfigurationContext =
    createContext<CampaignFormConfigurationType>({
        isEditMode: false,
        configuration: {} as WizardConfiguration,
        getStepConfiguration: () => ({} as WizardStepConfiguration),
    })

type OwnProps = {
    value: CampaignFormConfigurationType
    children: ReactNode
}

export const CampaigFormConfigurationProvider = ({
    value,
    children,
}: OwnProps) => {
    const getStepConfiguration = (step: string) => {
        if (!value?.configuration?.stepConfiguration) {
            return
        }

        return value?.configuration?.stepConfiguration[step]
    }

    return (
        <CampaignFormConfigurationContext.Provider
            value={{...value, getStepConfiguration}}
        >
            {children}
        </CampaignFormConfigurationContext.Provider>
    )
}
