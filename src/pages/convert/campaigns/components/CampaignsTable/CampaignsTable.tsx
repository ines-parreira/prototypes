import React, {MouseEvent, useCallback, useMemo, useRef, useState} from 'react'
import {Link, useHistory} from 'react-router-dom'
import classnames from 'classnames'
import {Map} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {Tooltip} from '@gorgias/ui-kit'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import IconButton from 'pages/common/components/button/IconButton'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import ToggleInput from 'pages/common/forms/ToggleInput'
import TableHead from 'pages/common/components/table/TableHead'
import {NumberedPagination} from 'pages/common/components/Paginations/NumberedPagination'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

import {ABGroupStatus} from 'pages/convert/campaigns/types/enums/ABGroupStatus.enum'

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
import {LightCampaignModalType} from 'pages/convert/campaigns/types/enums/LightCampaignModalType'
import {useIsConvertScheduleCampaignEnabled} from 'pages/convert/common/hooks/useIsConvertScheduleCampaignEnabled'

import useLocalStorage from 'hooks/useLocalStorage'
import {useIsCampaignCreationAllowed} from 'pages/convert/campaigns/hooks/useIsCampaignCreationAllowed'
import {useGetActiveCampaignsCount} from 'pages/convert/campaigns/hooks/useGetActiveCampaignsCount'
import {GorgiasChatIntegration} from 'models/integration/types'
import {abVariantsUrl} from 'pages/convert/abVariants/urls'

import {
    CampaignStatus,
    isActiveStatus,
} from '../../types/enums/CampaignStatus.enum'
import {SortingKeys, useSortedCampaigns} from '../../hooks/useSortedCampaigns'

import {Campaign} from '../../types/Campaign'

import {CampaignPreviewPopover} from '../CampaignPreviewPopover'

import {CampaignToolsCell} from './components/CampaignToolsCell'
import ABGroupVariants from './components/ABGroupVariants'

import css from './CampaignsTable.less'

const TOOGLE_TOOLTIP_MAX_ACTIVE_CAMPAIGNS =
    'You already have 3 or more campaigns active. Disable them to activate this one.'

const TOOGLE_TOOPTIP_AB_TEST_COMPLETED =
    'The A/B test is completed and cannot be re-activated.'

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
    const currentDate = new Date()

    const {sortBy, sortDirection, sortedCampaigns, changeSorting} =
        useSortedCampaigns(data)

    const [isLightModalOpen, setIsLightModalOpen] = useState(false)
    const [toggleState, setToggleState] = useState<Record<string, boolean>>({})

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
            (integration.toJS() as GorgiasChatIntegration).meta
        )
    }, [integration])

    const isScheduleCampaignEnabled = useIsConvertScheduleCampaignEnabled()

    const renderRows = useCallback(
        (campaign: Campaign, index: number) => {
            let editLink = `/app/convert/${
                integration.get('id') as number
            }/campaigns/${campaign.id}`

            if (campaign.ab_group) {
                editLink = abVariantsUrl(integration.get('id'), campaign.id)
            }

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

            const scheduleLabel = () => {
                if (!campaign?.schedule) {
                    return ''
                }

                const startDate = new Date(
                    campaign.schedule.start_datetime
                ).toLocaleDateString('en-US')

                const endDate = campaign.schedule.end_datetime
                    ? new Date(
                          campaign.schedule.end_datetime
                      ).toLocaleDateString('en-US')
                    : null

                if (startDate && !endDate) {
                    return `${startDate} - Not set`
                }

                return `${startDate} - ${endDate}`
            }

            const language = getGorgiasChatLanguageByCode(
                (campaign.language ?? defaultLanguage) as Language
            ) as LanguageUI

            const isCampaignActive = isActiveStatus(campaign.status)
            const toggleDisabled = campaign.ab_group
                ? campaign.ab_group?.status === ABGroupStatus.Completed ||
                  isAtCampaignsLimit ||
                  isOverCampaignsLimit
                : !isCampaignActive &&
                  (isAtCampaignsLimit || isOverCampaignsLimit)

            const hasCampaignEnded =
                isScheduleCampaignEnabled &&
                campaign.status === CampaignStatus.Inactive &&
                campaign.schedule?.end_datetime
                    ? new Date(campaign.schedule.end_datetime) < currentDate
                    : false

            const toggleId = `toggle-${campaign.id}`

            return (
                <>
                    <TableBodyRow key={index} className={css.tableRow}>
                        <BodyCell style={{width: 88}}>
                            <span id={toggleId}>
                                <ToggleInput
                                    isToggled={isCampaignActive}
                                    isDisabled={
                                        toggleDisabled || hasCampaignEnded
                                    }
                                    onClick={() => onClickToggle(campaign)}
                                    aria-label={`Enable campaign ${campaign.name}`}
                                />
                            </span>
                            {toggleDisabled && (
                                <Tooltip
                                    target={toggleId}
                                    placement="bottom-start"
                                >
                                    {campaign.ab_group
                                        ? TOOGLE_TOOPTIP_AB_TEST_COMPLETED
                                        : TOOGLE_TOOLTIP_MAX_ACTIVE_CAMPAIGNS}
                                </Tooltip>
                            )}
                        </BodyCell>
                        <CampaignPreviewPopover
                            message={campaign.message_text}
                            triggers={campaign.triggers}
                        >
                            <BodyCell innerClassName={css.anchorCell}>
                                {campaign.ab_group && (
                                    <IconButton
                                        fillStyle="ghost"
                                        intent="secondary"
                                        className={css.toggleBtn}
                                        onClick={() => {
                                            setToggleState((state) => {
                                                return {
                                                    ...state,
                                                    [campaign.id]:
                                                        !state[campaign.id],
                                                }
                                            })
                                        }}
                                    >
                                        {!toggleState[campaign.id]
                                            ? 'arrow_right'
                                            : 'arrow_drop_down'}
                                    </IconButton>
                                )}
                                <Link
                                    className={css.anchor}
                                    to={editLink}
                                    onClick={onClickEdit}
                                >
                                    <div>
                                        <b>{campaign.name}</b>
                                        {campaign.ab_group && (
                                            <Badge
                                                className={css.abBadge}
                                                type={ColorType.LightDark}
                                            >
                                                A/B Test
                                            </Badge>
                                        )}
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
                        {isScheduleCampaignEnabled && (
                            <BodyCell style={{minWidth: 200}}>
                                <div>{scheduleLabel()}</div>
                            </BodyCell>
                        )}

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
                    {toggleState[campaign.id] && (
                        <ABGroupVariants
                            variants={campaign.variants}
                            integrationId={integration.get('id') as string}
                            campaignId={campaign.id}
                        />
                    )}
                </>
            )
        },
        // There is no need to add here currentDate
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            setToggleState,
            toggleState,
            isScheduleCampaignEnabled,
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
                    {isScheduleCampaignEnabled && (
                        <HeaderCellProperty
                            style={{minWidth: 200}}
                            isOrderedBy={sortBy === 'schedule'}
                            direction={
                                sortBy === 'schedule'
                                    ? sortDirection
                                    : undefined
                            }
                            title="Schedule"
                            onClick={handleChangeSort('schedule')}
                            titleClassName={css.headerCellTitle}
                        />
                    )}

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
