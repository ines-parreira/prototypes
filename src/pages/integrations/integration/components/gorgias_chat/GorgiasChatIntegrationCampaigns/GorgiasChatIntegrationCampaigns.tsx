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
import debounce from 'lodash/debounce'
import Fuse from 'fuse.js'

import history from 'pages/history'

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

import useSearch from 'hooks/useSearch'

import GorgiasChatIntegrationHeader from '../GorgiasChatIntegrationHeader'
import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'

import {CampaignChatHiddenWarning} from './components/CampaignChatHiddenWarning'
import {CampaignsTable} from './components/CampaignsTable'
import {CampaignsSearch} from './components/CampaignsSearch'

import {ChatCampaign} from './types/Campaign'

import css from './GorgiasChatIntegrationCampaigns.less'

type Props = {
    integration: Map<any, any>
    currentUser: Map<any, any>
} & ConnectedProps<typeof connector>

function setSearch(searchValue: string) {
    if (searchValue === '') {
        history.replace('?')
    } else {
        history.replace(
            `?search=${encodeURIComponent(
                searchValue.toLocaleLowerCase().trim()
            )}`
        )
    }
}

const debouncedSetSearch = debounce(setSearch, 200)

export const GorgiasChatIntegrationCampaignsComponent = ({
    integration,
    currentUser,
    createCampaign,
    deleteCampaign,
    updateCampaign,
}: Props) => {
    const params = useSearch<{search: string}>()
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

    const handleChangeSearch = (value: string) => {
        debouncedSetSearch(value)
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
        let campaignsByStatus = allCampaigns

        if (statusFilter === 'active') {
            campaignsByStatus = allCampaigns.filter(
                (campaign) => !campaign.deactivated_datetime
            )
        }

        if (statusFilter === 'inactive') {
            campaignsByStatus = allCampaigns.filter(
                (campaign) => campaign.deactivated_datetime
            )
        }

        if (params.search) {
            const fuse = new Fuse(campaignsByStatus, {
                threshold: 0.25,
                keys: ['name'],
            })

            campaignsByStatus = fuse
                .search(params.search)
                .map((result) => result.item)
        }

        return campaignsByStatus
    }, [allCampaigns, params.search, statusFilter])

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
                    <CampaignsSearch
                        value={params.search}
                        onChange={handleChangeSearch}
                        onClear={() => setSearch('')}
                    />

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

                {campaigns.length === 0 && allCampaigns.length === 0 && (
                    <div className={css.noCampaignsLayer}>
                        This integration doesn't have any campaigns yet.
                    </div>
                )}

                {campaigns.length === 0 && allCampaigns.length > 0 && (
                    <div className={css.noCampaignsLayer}>
                        No campaigns match your search and filters.
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
