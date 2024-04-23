import React, {MouseEvent, useCallback, useMemo, useRef, useState} from 'react'
import {Link, useHistory} from 'react-router-dom'
import classnames from 'classnames'
import {Map} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import ToggleInput from 'pages/common/forms/ToggleInput'
import TableHead from 'pages/common/components/table/TableHead'
import {NumberedPagination} from 'pages/common/components/Paginations/NumberedPagination'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    LanguageUI,
    getGorgiasChatLanguageByCode,
    getPrimaryLanguageFromChatConfig,
} from 'config/integrations/gorgias_chat'
import {BadgeItem} from 'pages/settings/helpCenter/components/HelpCenterPreferencesView/components/BadgeList'
import {Language} from 'constants/languages'
import LightCampaignBadge from 'pages/convert/campaigns/components/LightCampaignBadge/LightCampaignBadge'
import LightCampaignModal from 'pages/convert/campaigns/components/LightCampaignModal/LightCampaignModal'
import {ACTIVE_CAMPAIGNS_LIMIT} from 'pages/convert/campaigns/constants/lightCampaigns'
import Tooltip from 'pages/common/components/Tooltip'
import {LightCampaignModalType} from 'pages/convert/campaigns/types/enums/LightCampaignModalType'
import useLocalStorage from 'hooks/useLocalStorage'
import {useIsCampaignCreationAllowed} from 'pages/convert/campaigns/hooks/useIsCampaignCreationAllowed'
import {useGetActiveCampaignsCount} from 'pages/convert/campaigns/hooks/useGetActiveCampaignsCount'
import {isActiveStatus} from '../../types/enums/CampaignStatus.enum'
import {SortingKeys, useSortedCampaigns} from '../../hooks/useSortedCampaigns'

import {Campaign} from '../../types/Campaign'

import {CampaignPreviewPopover} from '../CampaignPreviewPopover'

import {CampaignToolsCell} from './components/CampaignToolsCell'

import css from './CampaignsTable.less'

const TOOGLE_TOOLTIP_MAX_ACTIVE_CAMPAIGNS =
    'You already have 3 or more campaigns active. Disable them to activate this one.'

type Props = {
    data: Campaign[]
    integration: Map<any, any>
    perPage?: number
    page?: number
    isUpdatingCampaign: boolean
    isDeletingCampaign: boolean
    onClickDelete: (campaign: Campaign) => void
    onClickDuplicate: (event: MouseEvent, campaign: Campaign) => void
    onChangePage: (page: number) => void
    onToggleCampaign: (campaign: Campaign) => void
}

export const CampaignsTable = ({
    data,
    integration,
    perPage = 25,
    page = 1,
    isUpdatingCampaign,
    isDeletingCampaign,
    onClickDelete,
    onClickDuplicate,
    onChangePage,
    onToggleCampaign,
}: Props) => {
    const history = useHistory()
    const {sortBy, sortDirection, sortedCampaigns, changeSorting} =
        useSortedCampaigns(data)

    const [isLightModalOpen, setIsLightModalOpen] = useState(false)
    const onLightModalSubmitFn = useRef<() => void>()

    const storageKey = useMemo(() => {
        return `convert:lightModal:${integration.get('id') as string}:${
            LightCampaignModalType.DeactivateCampaign
        }`
    }, [integration])
    const [lightModalDismissed, setLightModalDismissed] = useLocalStorage<
        boolean | undefined
    >(storageKey)

    const handleChangeSort = useCallback(
        (key: SortingKeys) => () => changeSorting(key),
        [changeSorting]
    )

    const campaignCreationAllowed = useIsCampaignCreationAllowed(integration)
    const activeCampaignsCount = useGetActiveCampaignsCount(sortedCampaigns)

    const isOverCampaignsLimit = useMemo(() => {
        return (
            !campaignCreationAllowed &&
            activeCampaignsCount > ACTIVE_CAMPAIGNS_LIMIT
        )
    }, [campaignCreationAllowed, activeCampaignsCount])

    const isAtCampaignsLimit = useMemo(() => {
        return (
            !campaignCreationAllowed &&
            activeCampaignsCount === ACTIVE_CAMPAIGNS_LIMIT
        )
    }, [campaignCreationAllowed, activeCampaignsCount])

    const onClickToggle = useCallback(
        (campaign: Campaign) => {
            if (isOverCampaignsLimit && !lightModalDismissed) {
                onLightModalSubmitFn.current = () => {
                    onToggleCampaign(campaign)
                    setIsLightModalOpen(false)
                }
                setIsLightModalOpen(true)
            } else {
                onToggleCampaign(campaign)
            }
        },
        [isOverCampaignsLimit, lightModalDismissed, onToggleCampaign]
    )

    const chatMultiLanguagesEnabled =
        useFlags()[FeatureFlagKey.ChatMultiLanguages]

    const defaultLanguage = useMemo<string>(() => {
        return getPrimaryLanguageFromChatConfig(
            (integration.get('meta') as Map<string, string>).toJS()
        )
    }, [integration])

    const renderRows = useCallback(
        (campaign: Campaign, index: number) => {
            const editLink = `/app/convert/${
                integration.get('id') as number
            }/campaigns/${campaign.id}`

            const onClickEdit = (event: React.UIEvent) => {
                event.preventDefault()
                history.push(editLink, {
                    previousSearch: window.location.search,
                })
            }

            const creationDate = campaign?.created_datetime
                ? new Date(campaign.created_datetime).toLocaleDateString(
                      'en-US'
                  )
                : ''

            const language = getGorgiasChatLanguageByCode(
                (campaign.language ?? defaultLanguage) as Language
            ) as LanguageUI

            const isCampaignActive = isActiveStatus(campaign.status)
            const toggleDisabled =
                !isCampaignActive &&
                (isAtCampaignsLimit || isOverCampaignsLimit)
            const toggleId = `toggle-${campaign.id}`

            return (
                <TableBodyRow key={index} className={css.tableRow}>
                    <BodyCell style={{width: 88}}>
                        <span id={toggleId}>
                            <ToggleInput
                                isToggled={isCampaignActive}
                                isDisabled={toggleDisabled}
                                onClick={() => onClickToggle(campaign)}
                                aria-label={`Enable campaign ${campaign.name}`}
                            />
                        </span>
                        {toggleDisabled && (
                            <Tooltip target={toggleId} placement="bottom-start">
                                {TOOGLE_TOOLTIP_MAX_ACTIVE_CAMPAIGNS}
                            </Tooltip>
                        )}
                    </BodyCell>
                    <CampaignPreviewPopover
                        message={campaign.message_text}
                        triggers={campaign.triggers}
                    >
                        <BodyCell innerClassName={css.anchorCell}>
                            <Link
                                className={css.anchor}
                                to={editLink}
                                onClick={onClickEdit}
                            >
                                <div>
                                    <b>{campaign.name}</b>
                                </div>
                                <LightCampaignBadge
                                    campaign={campaign}
                                    integration={integration}
                                    className={css.lightBadge}
                                />
                            </Link>
                        </BodyCell>
                    </CampaignPreviewPopover>
                    <BodyCell>
                        <div>{creationDate}</div>
                    </BodyCell>
                    {chatMultiLanguagesEnabled && (
                        <BodyCell size="small">
                            <BadgeItem
                                customClass={css.languageBadge}
                                key={language.value}
                                id={language.value as any}
                                label={`${language.label}${
                                    language.value === defaultLanguage
                                        ? ' (Default)'
                                        : ''
                                }`}
                            />
                        </BodyCell>
                    )}
                    <BodyCell style={{width: 110}}>
                        <CampaignToolsCell
                            campaign={campaign}
                            integration={integration}
                            createDisabled={!campaignCreationAllowed}
                            isDeletingCampaign={isDeletingCampaign}
                            isOverCampaignsLimit={isOverCampaignsLimit}
                            onClickDelete={onClickDelete}
                            onClickDuplicate={onClickDuplicate}
                            onClickEdit={onClickEdit}
                        />
                    </BodyCell>
                </TableBodyRow>
            )
        },
        [
            integration,
            defaultLanguage,
            isAtCampaignsLimit,
            isOverCampaignsLimit,
            chatMultiLanguagesEnabled,
            campaignCreationAllowed,
            isDeletingCampaign,
            onClickDelete,
            onClickDuplicate,
            history,
            onClickToggle,
        ]
    )

    const start = (page - 1) * perPage
    const end = start + perPage
    const paginatedRows = sortedCampaigns.slice(start, end)

    return (
        <>
            <TableWrapper
                className={classnames(
                    'table-integrations',
                    'mt-3',
                    css.campaignsTable
                )}
            >
                <TableHead>
                    <HeaderCellProperty title="" style={{width: 88}} />
                    <HeaderCellProperty
                        isOrderedBy={sortBy === 'name'}
                        direction={
                            sortBy === 'name' ? sortDirection : undefined
                        }
                        title="Campaign name"
                        onClick={handleChangeSort('name')}
                        titleClassName={css.headerCellTitle}
                    />
                    <HeaderCellProperty
                        isOrderedBy={sortBy === 'created_datetime'}
                        direction={
                            sortBy === 'created_datetime'
                                ? sortDirection
                                : undefined
                        }
                        title="Creation date"
                        onClick={handleChangeSort('created_datetime')}
                        titleClassName={css.headerCellTitle}
                    />
                    {chatMultiLanguagesEnabled && (
                        <HeaderCellProperty
                            title="Language"
                            titleClassName={css.headerCellTitle}
                        />
                    )}
                    <HeaderCellProperty title="" style={{width: 110}} />
                </TableHead>
                <TableBody>{paginatedRows.map(renderRows)}</TableBody>
            </TableWrapper>
            {data.length > perPage && (
                <NumberedPagination
                    className={css.pagination}
                    count={Math.ceil(data.length / perPage)}
                    page={page}
                    onChange={onChangePage}
                />
            )}
            {isOverCampaignsLimit && (
                <LightCampaignModal
                    modalType={LightCampaignModalType.DeactivateCampaign}
                    isOpen={isLightModalOpen}
                    isDismissed={!!lightModalDismissed}
                    setIsDismissed={setLightModalDismissed}
                    isSubmitting={isUpdatingCampaign}
                    onSubmit={onLightModalSubmitFn.current}
                    onClose={() => setIsLightModalOpen(false)}
                />
            )}
        </>
    )
}
