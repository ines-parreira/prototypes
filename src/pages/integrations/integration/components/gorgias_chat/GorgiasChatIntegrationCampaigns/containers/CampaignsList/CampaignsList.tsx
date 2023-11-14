import React, {MouseEvent, useEffect, useMemo} from 'react'
import {Map} from 'immutable'
import Fuse from 'fuse.js'

import {Container} from 'reactstrap'

import Segmented from 'pages/common/components/Segmented'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'

import {useIsRevenueBillingEnabled} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/hooks/useIsRevenueBillingEnabled'
import ConvertSetupBanner from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/components/ConvertSetupBanner/ConvertSetupBanner'
import {QuickFilters} from '../QuickFilters'

import {QUICK_FILTERS} from '../../constants/filters'

import {quickFiltersInvoke} from '../../utils/filters'

import {CampaignsTable} from '../../components/CampaignsTable'
import {CampaignsSearch} from '../../components/CampaignsSearch'
import {CampaignGenerator} from '../../components/CampaignGenerator'
import {CampaignChatHiddenWarning} from '../../components/CampaignChatHiddenWarning'

import {useCampaignListOptions} from '../../hooks/useCampaignListOptions'

import {ChatCampaign} from '../../types/Campaign'

import CampaignInfobarPaywall from '../../components/CampaignInfobarPaywall/CampaignInfobarPaywall'
import ConvertLimitBanner from '../../components/ConvertLimitBanner/ConvertLimitBanner'
import css from './CampaignsList.less'

type Props = {
    campaigns: ChatCampaign[]
    currentUser: Map<any, any>
    integration: Map<any, any>
    onDeleteCampaign: (campaign: ChatCampaign) => void
    onDuplicateCampaign: (event: MouseEvent, campaign: ChatCampaign) => void
    onUpdateCampaign: (campaign: ChatCampaign) => void
}

const PER_PAGE = 25

export const CampaignsList = ({
    campaigns,
    currentUser,
    integration,
    onDeleteCampaign,
    onDuplicateCampaign,
    onUpdateCampaign,
}: Props) => {
    const isConvertSubscriber = useIsConvertSubscriber()
    const isRevenueBillingEnabled = useIsRevenueBillingEnabled()
    const {getParams, onChangeParams} = useCampaignListOptions()

    const {page, search, state, filters} = getParams()

    const statusFilterOptions = useMemo(() => {
        return [
            {
                label: 'All',
                value: 'all',
            },
            {
                label: 'Active',
                value: 'active',
                disabled: !campaigns.some(
                    (campaign) => !campaign.deactivated_datetime
                ),
            },
            {
                label: 'Inactive',
                value: 'inactive',
                disabled: !campaigns.some(
                    (campaign) => campaign.deactivated_datetime
                ),
            },
        ]
    }, [campaigns])

    const filteredCampaigns = useMemo(() => {
        let campaignsByStatus = campaigns

        if (state === 'active') {
            campaignsByStatus = campaigns.filter(
                (campaign) => !campaign.deactivated_datetime
            )
        }

        if (state === 'inactive') {
            campaignsByStatus = campaigns.filter(
                (campaign) => campaign.deactivated_datetime
            )
        }

        if (search) {
            const fuse = new Fuse(campaignsByStatus, {
                threshold: 0.25,
                keys: ['name'],
            })

            campaignsByStatus = fuse.search(search).map((result) => result.item)
        }

        if (filters.length && isConvertSubscriber) {
            campaignsByStatus = quickFiltersInvoke(campaignsByStatus, filters)
        }

        return campaignsByStatus
    }, [campaigns, filters, isConvertSubscriber, search, state])

    const handleChangeSearch = (value: string) => {
        onChangeParams({search: value, page: 1})
    }

    const handleClearSearch = () => {
        onChangeParams({search: '', page: 1})
    }

    const handleUpdateStateFilter = (_: any, value: string) => {
        onChangeParams({state: value, page: 1})
    }

    const handleChangePage = (page: number) => {
        onChangeParams({page})
    }

    const handleChangeFilters = (filters: string[]) => {
        onChangeParams({filters: filters.join(','), page: 1})
    }

    // Check if page is out of range or the state filter is invalid or disabled and default to default values
    useEffect(() => {
        if (page) {
            if (
                page < 0 ||
                page > Math.ceil(filteredCampaigns.length / PER_PAGE)
            ) {
                onChangeParams({page: 1})
            }
        }

        if (state) {
            if (
                !statusFilterOptions.some(
                    (option) => option.value === state && !option.disabled
                )
            ) {
                onChangeParams({state: 'all'})
            }
        }
    }, [
        filteredCampaigns.length,
        onChangeParams,
        page,
        state,
        statusFilterOptions,
    ])

    return (
        <>
            <Container fluid className={css.pageContainer}>
                <div className={css.campaignsToolbar}>
                    <CampaignsSearch
                        value={search}
                        onChange={handleChangeSearch}
                        onClear={handleClearSearch}
                    />

                    {campaigns.length > 0 && (
                        <Segmented
                            options={statusFilterOptions}
                            value={state}
                            onChange={handleUpdateStateFilter}
                        />
                    )}
                </div>

                {isConvertSubscriber && (
                    <div className={css.quickFiltersContainer}>
                        <QuickFilters
                            filters={QUICK_FILTERS}
                            defaultActiveFilters={filters}
                            onChangeFilters={handleChangeFilters}
                        />
                    </div>
                )}

                <ConvertLimitBanner classes={'mt-4'} />
                <ConvertSetupBanner classes={'mt-4'} />

                {!isConvertSubscriber && isRevenueBillingEnabled && (
                    <CampaignInfobarPaywall />
                )}

                <CampaignChatHiddenWarning integration={integration} />

                <CampaignGenerator
                    integration={integration}
                    currentUser={currentUser}
                />

                {filteredCampaigns.length === 0 && campaigns.length === 0 && (
                    <div className={css.noCampaignsLayer}>
                        This integration doesn't have any campaigns yet.
                    </div>
                )}

                {filteredCampaigns.length === 0 && campaigns.length > 0 && (
                    <div className={css.noCampaignsLayer}>
                        No campaigns match your search and filters.
                    </div>
                )}
            </Container>

            {filteredCampaigns.length > 0 && (
                <CampaignsTable
                    data={filteredCampaigns}
                    integration={integration}
                    perPage={PER_PAGE}
                    page={page}
                    onClickDelete={onDeleteCampaign}
                    onClickDuplicate={onDuplicateCampaign}
                    onChangePage={handleChangePage}
                    onToggleCampaign={onUpdateCampaign}
                />
            )}
        </>
    )
}
