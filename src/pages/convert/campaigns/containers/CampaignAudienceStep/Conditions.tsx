import React from 'react'

import { AdvancedTriggersForm } from 'pages/convert/campaigns/components/AdvancedTriggersForm'
import { AdvancedTriggersSelect } from 'pages/convert/campaigns/components/AdvancedTriggersSelect'
import { CampaignDelay } from 'pages/convert/campaigns/components/CampaignDelay'
import { TriggersProvider } from 'pages/convert/campaigns/containers/TriggersProvider'
import { useCampaignDetailsContext } from 'pages/convert/campaigns/hooks/useCampaignDetailsContext'

import css from './CampaignAudienceStep.less'

type Props = {
    isConvertSubscriber?: boolean
    isShopifyStore?: boolean
    isConsideredLightCampaign?: boolean
    onValidationChange: (isValid: boolean) => void
}

export const Conditions = ({
    isConsideredLightCampaign = false,
    isConvertSubscriber,
    isShopifyStore,
    onValidationChange,
}: Props) => {
    const {
        campaign,
        triggers,
        updateCampaign,
        addTrigger,
        updateTrigger,
        deleteTrigger,
    } = useCampaignDetailsContext()

    const campaignDelay = campaign.meta?.delay ?? 0

    const handleUpdateDelay = (value: number) => updateCampaign('delay', value)

    return (
        <div>
            <div className="mb-4">
                <TriggersProvider
                    triggers={triggers}
                    onUpdateTrigger={updateTrigger}
                    onDeleteTrigger={deleteTrigger}
                >
                    <AdvancedTriggersForm
                        triggers={triggers}
                        onValidationChange={onValidationChange}
                    />
                    <AdvancedTriggersSelect
                        isShopifyStore={isShopifyStore}
                        isConvertSubscriber={isConvertSubscriber}
                        isLightCampaign={isConsideredLightCampaign}
                        onClick={addTrigger}
                    />
                </TriggersProvider>
            </div>
            <div className={css.delaySelector}>
                <CampaignDelay
                    delay={campaignDelay}
                    onChangeDelay={handleUpdateDelay}
                />
            </div>
        </div>
    )
}
