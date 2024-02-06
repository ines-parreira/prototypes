import React, {MouseEvent, useCallback, useMemo} from 'react'
import {Link} from 'react-router-dom'
import {Map, fromJS, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import moment from 'moment'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {removeLinksFromHtml} from 'utils/html'
import {
    createCampaign,
    deleteCampaign,
    updateCampaign,
} from 'state/campaigns/actions'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import {IntegrationType} from 'models/integration/constants'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader'

import {FeatureFlagKey} from 'config/featureFlags'
import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'
import {CampaignsList} from './containers/CampaignsList'
import {CampaignListOptions} from './providers/CampaignListOptions'
import {ChatCampaign} from './types/Campaign'
import css from './GorgiasChatIntegrationCampaigns.less'

type Props = {
    integration: Map<any, any>
    currentUser: Map<any, any>
} & ConnectedProps<typeof connector>

export const GorgiasChatIntegrationCampaignsComponent = ({
    integration,
    currentUser,
    createCampaign,
    deleteCampaign,
    updateCampaign,
}: Props) => {
    const toggleCampaign = useCallback(
        (campaign: ChatCampaign) => {
            let form: Map<any, any> = fromJS(campaign)

            if (campaign.deactivated_datetime) {
                form = form.set('deactivated_datetime', null)
            } else {
                form = form.set('deactivated_datetime', moment.utc())
            }

            void updateCampaign(form, integration)
        },
        [integration, updateCampaign]
    )

    const handleDuplicateCampaign = useCallback(
        async (event: MouseEvent, campaign: ChatCampaign) => {
            event.stopPropagation()

            const duplicate = {
                ...campaign,
                id: '',
                name: `(Copy) ${campaign.name}`,
                deactivated_datetime: new Date().toISOString(),
                message: {
                    text: campaign.message.text ?? '',
                    html: removeLinksFromHtml(campaign.message.html) ?? '',
                },
            }

            delete duplicate['tracking_tag_id']

            await createCampaign(fromJS(duplicate), integration)
        },
        [createCampaign, integration]
    )

    const handleDeleteCampaign = useCallback(
        (campaign: ChatCampaign) =>
            deleteCampaign(fromJS(campaign), integration),
        [deleteCampaign, integration]
    )

    const allCampaigns = useMemo(() => {
        const campaignsList =
            (integration.getIn(['meta', 'campaigns']) as List<any>) ||
            fromJS([])
        return campaignsList.toJS() as ChatCampaign[]
    }, [integration])

    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

    return (
        <CampaignListOptions>
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link
                                    to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                                >
                                    Chat
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                >
                    {!changeAutomateSettingButtomPosition && (
                        <GorgiasChatIntegrationConnectedChannel
                            integration={integration}
                        />
                    )}
                    <Link
                        to={
                            `/app/settings/channels/${IntegrationType.GorgiasChat}/` +
                            `${integration.get('id') as string}/campaigns/new`
                        }
                        className={css.createCampaignLink}
                    >
                        <Button>Create Campaign</Button>
                    </Link>
                </PageHeader>

                <GorgiasChatIntegrationHeader integration={integration} />

                <CampaignsList
                    campaigns={allCampaigns}
                    currentUser={currentUser}
                    integration={integration}
                    onDeleteCampaign={handleDeleteCampaign}
                    onDuplicateCampaign={handleDuplicateCampaign}
                    onUpdateCampaign={toggleCampaign}
                />
            </div>
        </CampaignListOptions>
    )
}

const connector = connect(null, {
    createCampaign,
    deleteCampaign,
    updateCampaign,
})

export default connector(GorgiasChatIntegrationCampaignsComponent)
