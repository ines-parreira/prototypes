import React, {useMemo} from 'react'
import {Map} from 'immutable'

import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {IntegrationProvider} from 'pages/convert/campaigns/containers/IntegrationProvider'

import Triggers from 'pages/convert/onboarding/components/SimpleCampaignEditor/components/Triggers'
import TextEditor from 'pages/convert/onboarding/components/SimpleCampaignEditor/components/TextEditor'
import {WizardConfiguration} from 'pages/convert/campaigns/types/CampaignFormConfiguration'
import {
    CampaigFormConfigurationProvider,
    CampaignFormConfigurationType,
} from 'pages/convert/campaigns/providers/CampaignDetailsForm/configurationContext'

import css from './SimpleCampaignEditor.less'

type Props = {
    campaign: Campaign
    integration: Map<any, any>
    shopifyIntegration: Map<any, any>
    wizardConfiguration?: WizardConfiguration
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
        onCampaignUpdate,
    } = props

    const formConfiguration = useMemo(
        () =>
            ({
                isEditMode: false,
                configuration: wizardConfiguration,
            } as CampaignFormConfigurationType),
        [wizardConfiguration]
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
