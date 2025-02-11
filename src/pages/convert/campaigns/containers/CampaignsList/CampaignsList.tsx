import {Skeleton} from '@gorgias/merchant-ui-kit'
import Fuse from 'fuse.js'
import {Map} from 'immutable'
import React, {MouseEvent, useEffect, useMemo} from 'react'

import {Container} from 'reactstrap'

import Segmented from 'pages/common/components/Segmented'

import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import ConvertSetupBanner from 'pages/convert/campaigns/components/ConvertSetupBanner'
import InventoryScopeMissingBanner from 'pages/convert/campaigns/components/InventoryScopeMissingBanner'
import {isActiveStatus} from 'pages/convert/campaigns/types/enums/CampaignStatus.enum'

import {CampaignChatHiddenWarning} from '../../components/CampaignChatHiddenWarning'
import {CampaignsSearch} from '../../components/CampaignsSearch'
import {CampaignsTable} from '../../components/CampaignsTable'
import {ConvertLimitBanner} from '../../components/ConvertLimitBanner/ConvertLimitBanner'

import {QUICK_FILTERS} from '../../constants/filters'

import {useCampaignListOptions} from '../../hooks/useCampaignListOptions'

import {Campaign} from '../../types/Campaign'

import {quickFiltersInvoke} from '../../utils/filters'
import {QuickFilters} from '../QuickFilters'
import css from './CampaignsList.less'

type Props = {
    campaigns: Campaign[]
    integration: Map<any, any>
    isLoading: boolean
    isUpdatingCampaign: boolean
    isDeletingCampaign: boolean
    onDeleteCampaign: (campaign: Campaign) => void
    onDuplicateCampaign: (event: MouseEvent, campaign: Campaign) => void
    onUpdateCampaign: (campaign: Campaign) => void
}

const PER_PAGE = 25

const CampaignsList = ({
    campaigns,
    integration,
    isLoading,
    isUpdatingCampaign,
    isDeletingCampaign,
    onDeleteCampaign,
    onDuplicateCampaign,
    onUpdateCampaign,
}: Props) => {
    const isConvertSubscriber = useIsConvertSubscriber()
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
                disabled: !campaigns.some((campaign) =>
                    isActiveStatus(campaign.status)
                ),
            },
            {
                label: 'Inactive',
                value: 'inactive',
                disabled: !campaigns.some(
                    (campaign) => !isActiveStatus(campaign.status)
                ),
            },
        ]
    }, [campaigns])

    const filteredCampaigns = useMemo(() => {
        let campaignsByStatus = campaigns

        if (state === 'active') {
            campaignsByStatus = campaigns.filter((campaign) =>
                isActiveStatus(campaign.status)
            )
        }

        if (state === 'inactive') {
            campaignsByStatus = campaigns.filter(
                (campaign) => !isActiveStatus(campaign.status)
            )
        }

        if (search) {
            const fuse = new Fuse(campaignsByStatus, {
                threshold: 0.25,
                distance: 1020,
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

    if (isLoading) {
        return (
            <Container fluid className={css.pageContainer}>
                <div className={css.mainLoader}>
                    <Skeleton height={75} width={'100%'} />
                </div>
                <div>
                    <SkeletonLoader className={css.loader} length={10} />
                </div>
            </Container>
        )
    }

    return (
        <>
            <Container fluid className={css.pageContainer}>
                <div
                    className={css.infoLinks}
                    data-candu-id="convert-links-campaign-list"
                ></div>

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

                <ConvertLimitBanner
                    classes={'mt-4'}
                    shopIntegrationId={integration.getIn([
                        'meta',
                        'shop_integration_id',
                    ])}
                />
                <ConvertSetupBanner
                    classes={'mt-4'}
                    shopIntegrationId={integration.getIn([
                        'meta',
                        'shop_integration_id',
                    ])}
                    chatIntegrationId={integration.get('id')}
                />
                {isConvertSubscriber && (
                    <InventoryScopeMissingBanner
                        className={'mt-4'}
                        shopIntegrationId={integration.getIn([
                            'meta',
                            'shop_integration_id',
                        ])}
                    />
                )}

                <CampaignChatHiddenWarning integration={integration} />

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
                    isUpdatingCampaign={isUpdatingCampaign}
                    isDeletingCampaign={isDeletingCampaign}
                    onClickDelete={onDeleteCampaign}
                    onClickDuplicate={onDuplicateCampaign}
                    onChangePage={handleChangePage}
                    onToggleCampaign={onUpdateCampaign}
                />
            )}
        </>
    )
}

export default CampaignsList
