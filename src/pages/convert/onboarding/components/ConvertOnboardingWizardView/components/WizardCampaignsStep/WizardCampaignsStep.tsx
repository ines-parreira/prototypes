import {Map} from 'immutable'
import React, {useMemo} from 'react'

import {useListCampaigns} from 'models/convert/campaign/queries'
import {CampaignListOptions} from 'models/convert/campaign/types'
import {ONBOARDING_CAMPAIGN_TEMPLATES_LIST} from 'pages/convert/campaigns/templates'
import {CampaignTemplate} from 'pages/convert/campaigns/templates/types'
import {Campaign} from 'pages/convert/campaigns/types/Campaign'
import {CampaignStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'

import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import ConvertOnboardingCampaignTemplate from 'pages/convert/onboarding/components/ConvertOnboardingCampaignTemplate'
import {toJS} from 'utils'

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

    const isSelected = (template: CampaignTemplate, campaigns: Campaign[]) =>
        campaigns.some(
            (c) =>
                c.template_id === template.slug &&
                c.status === CampaignStatus.Active
        )

    const allCampaigns = useMemo(() => {
        return (campaigns || []) as Campaign[]
    }, [campaigns])

    const findCampaign = (
        template: CampaignTemplate,
        campaigns: Campaign[]
    ): Campaign | undefined =>
        campaigns.find((c) => c.template_id === template.slug)

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
                        selected={isSelected(template, allCampaigns)}
                        campaign={findCampaign(template, allCampaigns)}
                    />
                ))}
            </div>
        </>
    )
}

export default WizardCampaignsStep
