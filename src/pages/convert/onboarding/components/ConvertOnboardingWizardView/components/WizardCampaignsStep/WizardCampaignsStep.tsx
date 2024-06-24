import React, {useMemo} from 'react'
import {Map} from 'immutable'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {toJS} from 'utils'
import {ONBOARDING_CAMPAIGN_TEMPLATES_LIST} from 'pages/convert/campaigns/templates'
import {Campaign, CampaignListOptions} from 'models/convert/campaign/types'
import {useListCampaigns} from 'models/convert/campaign/queries'
import {CampaignTemplate} from 'pages/convert/campaigns/templates/types'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'
import ConvertOnboardingCampaignTemplate from 'pages/convert/onboarding/components/ConvertOnboardingCampaignTemplate'
import css from './WizardCampaignsStep.less'

type Props = {
    integration: Map<any, any>
}

const WizardCampaignsStep = ({integration}: Props) => {
    const {channelConnection} = useGetOrCreateChannelConnection(
        toJS(integration)
    )

    const campaignListOptions = useMemo(
        () =>
            (channelConnection?.id
                ? {
                      channelConnectionId: channelConnection?.id,
                  }
                : {}) as CampaignListOptions,
        [channelConnection]
    )

    const {data: campaigns} = useListCampaigns(campaignListOptions, {
        enabled: !!campaignListOptions.channelConnectionId,
    })

    const isSelected = (template: CampaignTemplate, campaigns?: Campaign[]) =>
        !!campaigns &&
        campaigns.some(
            (c) =>
                c.template_id === template.slug &&
                c.status === CampaignStatus.Active
        )

    return (
        <>
            <h1 className={css.title}>
                Here are our recommended campaigns for you:
            </h1>

            <div className={css.description}>
                Customize campaign messages, and add your discount codes and
                product recommendations
            </div>

            <div className={css.templatesContainer}>
                {ONBOARDING_CAMPAIGN_TEMPLATES_LIST.map((template) => (
                    <ConvertOnboardingCampaignTemplate
                        key={template.slug}
                        template={template}
                        integration={integration}
                        selected={isSelected(template, campaigns)}
                    />
                ))}
            </div>
        </>
    )
}

export default WizardCampaignsStep
