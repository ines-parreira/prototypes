import React, {MouseEvent, Component} from 'react'
import {Link} from 'react-router-dom'
import {Map, fromJS, List} from 'immutable'
import {connect, ConnectedProps} from 'react-redux'
import moment from 'moment'
import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'

import {removeLinksFromHtml} from 'utils/html'

import {
    createCampaign,
    deleteCampaign,
    updateCampaign,
} from 'state/campaigns/actions'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import {IntegrationType} from 'models/integration/constants'
import CampaignGenerator from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/components/CampaignGenerator/CampaignGenerator'

import GorgiasChatIntegrationHeader from '../GorgiasChatIntegrationHeader'
import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'

import {CampaignChatHiddenWarning} from './components/CampaignChatHiddenWarning'
import {CampaignsTable} from './components/CampaignsTable'

import css from './GorgiasChatIntegrationCampaigns.less'
import {ChatCampaign} from './types/Campaign'

type Props = {
    integration: Map<any, any>
    currentUser: Map<any, any>
} & ConnectedProps<typeof connector>

export class GorgiasChatIntegrationCampaignsComponent extends Component<Props> {
    toggleCampaign = (campaign: ChatCampaign) => {
        const {updateCampaign, integration} = this.props
        let form: Map<any, any> = fromJS(campaign)

        if (campaign.deactivated_datetime) {
            form = form.set('deactivated_datetime', null)
        } else {
            form = form.set('deactivated_datetime', moment.utc())
        }

        void updateCampaign(form, integration)
    }

    handleDuplicateCampaign = async (
        event: MouseEvent,
        campaign: ChatCampaign
    ) => {
        event.stopPropagation()

        const {createCampaign, integration} = this.props

        await createCampaign(
            fromJS({
                ...campaign,
                id: '',
                name: `${campaign.name} (copy)`,
                deactivated_datetime: new Date().toISOString(),
                message: {
                    text: campaign.message.text ?? '',
                    html: removeLinksFromHtml(campaign.message.html) ?? '',
                },
            }),
            integration
        )
    }

    handleDeleteCampaign = async (campaign: ChatCampaign) => {
        const {deleteCampaign, integration} = this.props
        await deleteCampaign(fromJS(campaign), integration)
    }

    render() {
        const {integration, currentUser} = this.props

        const campaigns: List<any> =
            integration.getIn(['meta', 'campaigns']) || fromJS([])

        return (
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
                    <GorgiasChatIntegrationConnectedChannel
                        integration={integration}
                    />
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

                <Container fluid className={css.pageContainer}>
                    <span>
                        Use campaigns to prompt visitors of your website to
                        start chatting with your team.
                    </span>

                    <CampaignChatHiddenWarning integration={integration} />

                    <CampaignGenerator
                        integration={integration}
                        currentUser={currentUser}
                    />

                    {campaigns.isEmpty() && (
                        <div>
                            This integration doesn't have any campaigns yet.
                        </div>
                    )}
                </Container>

                {!campaigns.isEmpty() && (
                    <CampaignsTable
                        data={campaigns.toJS() as ChatCampaign[]}
                        integration={integration}
                        onClickDelete={this.handleDeleteCampaign}
                        onClickDuplicate={this.handleDuplicateCampaign}
                        onToggleCampaign={this.toggleCampaign}
                    />
                )}
            </div>
        )
    }
}

const connector = connect(null, {
    createCampaign,
    deleteCampaign,
    updateCampaign,
})

export default connector(GorgiasChatIntegrationCampaignsComponent)
