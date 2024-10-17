import React, {ReactNode, createContext} from 'react'

import {
    WizardConfiguration,
    WizardStepConfiguration,
    ToolbarActionConfiguration,
    UtmConfiguration,
} from 'pages/convert/campaigns/types/CampaignFormConfiguration'

export interface CampaignFormConfigurationType {
    isEditMode: boolean
    configuration?: WizardConfiguration
    utmConfiguration?: UtmConfiguration
    getStepConfiguration: (step: string) => WizardStepConfiguration | undefined
    getTourConfiguration: () =>
        | Record<string, ToolbarActionConfiguration>
        | undefined
}

export const CampaignFormConfigurationContext =
    createContext<CampaignFormConfigurationType>({
        isEditMode: false,
        configuration: {} as WizardConfiguration,
        getStepConfiguration: () => ({}) as WizardStepConfiguration,
        getTourConfiguration: () =>
            ({}) as Record<string, ToolbarActionConfiguration>,
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

    const getTourConfiguration = () => {
        if (!value?.configuration?.toolbarConfiguration) {
            return
        }

        return value?.configuration?.toolbarConfiguration
    }

    return (
        <CampaignFormConfigurationContext.Provider
            value={{...value, getStepConfiguration, getTourConfiguration}}
        >
            {children}
        </CampaignFormConfigurationContext.Provider>
    )
}
