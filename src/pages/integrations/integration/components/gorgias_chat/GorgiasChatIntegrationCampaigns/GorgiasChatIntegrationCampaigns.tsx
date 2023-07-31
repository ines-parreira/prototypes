import React, {
    ChangeEvent,
    MouseEvent,
    useCallback,
    useMemo,
    useState,
} from 'react'
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
import Segmented from 'pages/common/components/Segmented'
import CampaignGenerator from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/components/CampaignGenerator/CampaignGenerator'

import {IntegrationType} from 'models/integration/constants'

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

export const GorgiasChatIntegrationCampaignsComponent = ({
    integration,
    currentUser,
    createCampaign,
    deleteCampaign,
    updateCampaign,
}: Props) => {
    const [statusFilter, setStatusFilter] = useState('all')

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
        },
        [createCampaign, integration]
    )

    const handleDeleteCampaign = useCallback(
        (campaign: ChatCampaign) =>
            deleteCampaign(fromJS(campaign), integration),
        [deleteCampaign, integration]
    )

    const handleUpdateStatusFilter = (event: ChangeEvent, value: string) => {
        setStatusFilter(value)
    }

    const allCampaigns = useMemo(() => {
        const campaignsList =
            (integration.getIn(['meta', 'campaigns']) as List<any>) ||
            fromJS([])
        return campaignsList.toJS() as ChatCampaign[]
    }, [integration])

    const statusFilterOptions = useMemo(() => {
        return [
            {
                label: 'All',
                value: 'all',
            },
            {
                label: 'Active',
                value: 'active',
                disabled: !allCampaigns.some(
                    (campaign) => !campaign.deactivated_datetime
                ),
            },
            {
                label: 'Inactive',
                value: 'inactive',
                disabled: !allCampaigns.some(
                    (campaign) => campaign.deactivated_datetime
                ),
            },
        ]
    }, [allCampaigns])

    const campaigns = useMemo(() => {
        if (statusFilter === 'active') {
            return allCampaigns.filter(
                (campaign) => !campaign.deactivated_datetime
            )
        }

        if (statusFilter === 'inactive') {
            return allCampaigns.filter(
                (campaign) => campaign.deactivated_datetime
            )
        }

        return allCampaigns
    }, [allCampaigns, statusFilter])

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
                <div className={css.campaignsToolbar}>
                    <span>
                        Use campaigns to prompt visitors of your website to
                        start chatting with your team.
                    </span>

                    {allCampaigns.length > 0 && (
                        <Segmented
                            options={statusFilterOptions}
                            value={statusFilter}
                            onChange={handleUpdateStatusFilter}
                        />
                    )}
                </div>

                <CampaignChatHiddenWarning integration={integration} />

                <CampaignGenerator
                    integration={integration}
                    currentUser={currentUser}
                />

                {campaigns.length === 0 && (
                    <div className={css.noCampaignsLayer}>
                        This integration doesn't have any campaigns yet.
                    </div>
                )}
            </Container>

            {campaigns.length > 0 && (
                <CampaignsTable
                    data={campaigns}
                    integration={integration}
                    onClickDelete={handleDeleteCampaign}
                    onClickDuplicate={handleDuplicateCampaign}
                    onToggleCampaign={toggleCampaign}
                />
            )}
        </div>
    )
}

const connector = connect(null, {
    createCampaign,
    deleteCampaign,
    updateCampaign,
})

export default connector(GorgiasChatIntegrationCampaignsComponent)
