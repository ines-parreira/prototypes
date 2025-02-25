import React, { useMemo } from 'react'

import { Map } from 'immutable'

import { IntegrationProvider } from 'pages/convert/campaigns/containers/IntegrationProvider'
import {
    CampaigFormConfigurationProvider,
    CampaignFormConfigurationType,
} from 'pages/convert/campaigns/providers/CampaignDetailsForm/configurationContext'
import { Campaign } from 'pages/convert/campaigns/types/Campaign'
import {
    UtmConfiguration,
    WizardConfiguration,
} from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import TextEditor from 'pages/convert/onboarding/components/SimpleCampaignEditor/components/TextEditor'
import Triggers from 'pages/convert/onboarding/components/SimpleCampaignEditor/components/Triggers'

import css from './SimpleCampaignEditor.less'

type Props = {
    campaign: Campaign
    integration: Map<any, any>
    shopifyIntegration: Map<any, any>
    wizardConfiguration?: WizardConfiguration
    utmConfiguration?: UtmConfiguration
    isConvertSubscriber?: boolean
    onCampaignUpdate: (data: any) => void
}

export const SimpleCampaignEditor: React.FC<Props> = (props) => {
    const {
        campaign,
        isConvertSubscriber,
        integration,
        shopifyIntegration,
        wizardConfiguration,
        utmConfiguration,
        onCampaignUpdate,
    } = props

    const formConfiguration = useMemo(
        () =>
            ({
                isEditMode: false,
                configuration: wizardConfiguration,
                utmConfiguration: utmConfiguration,
            }) as CampaignFormConfigurationType,
        [wizardConfiguration, utmConfiguration],
    )

    return (
        <IntegrationProvider
            chatIntegration={integration}
            shopifyIntegration={shopifyIntegration}
        >
            <CampaigFormConfigurationProvider value={formConfiguration}>
                <div className={css.section}>
                    <div className={css.sectionHeader}>
                        <span>Conditions to display campaign:</span>
                    </div>
                    <div>
                        <Triggers
                            triggers={campaign?.triggers}
                            campaignMeta={campaign?.meta}
                        />
                    </div>
                </div>

                <div className={css.section}>
                    <div className={css.sectionHeader}>
                        <span>
                            Customize your message and add product
                            recommendations:
                        </span>
                    </div>
                    <div>
                        <TextEditor
                            isConvertSubscriber={isConvertSubscriber}
                            campaign={campaign}
                            onCampaignUpdate={onCampaignUpdate}
                        />
                    </div>
                </div>
            </CampaigFormConfigurationProvider>
        </IntegrationProvider>
    )
}

export default SimpleCampaignEditor
