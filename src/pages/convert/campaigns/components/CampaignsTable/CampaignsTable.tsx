import React, {MouseEvent, useCallback, useMemo} from 'react'
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
import {isActiveStatus} from '../../types/enums/CampaignStatus.enum'
import {SortingKeys, useSortedCampaigns} from '../../hooks/useSortedCampaigns'

import {Campaign} from '../../types/Campaign'

import {CampaignPreviewPopover} from '../CampaignPreviewPopover'

import {CampaignToolsCell} from './components/CampaignToolsCell'

import css from './CampaignsTable.less'

type Props = {
    data: Campaign[]
    integration: Map<any, any>
    perPage?: number
    page?: number
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
    onClickDelete,
    onClickDuplicate,
    onChangePage,
    onToggleCampaign,
}: Props) => {
    const history = useHistory()
    const {sortBy, sortDirection, sortedCampaigns, changeSorting} =
        useSortedCampaigns(data)

    const handleChangeSort = useCallback(
        (key: SortingKeys) => () => changeSorting(key),
        [changeSorting]
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

            const creationDate = campaign?.created_datetime
                ? new Date(campaign.created_datetime).toLocaleDateString(
                      'en-US'
                  )
                : ''

            const language = getGorgiasChatLanguageByCode(
                (campaign.language ?? defaultLanguage) as Language
            ) as LanguageUI

            return (
                <TableBodyRow key={index} className={css.tableRow}>
                    <BodyCell style={{width: 88}}>
                        <ToggleInput
                            isToggled={isActiveStatus(campaign.status)}
                            onClick={() => onToggleCampaign(campaign)}
                            aria-label={`Enable campaign ${campaign.name}`}
                        />
                    </BodyCell>
                    <CampaignPreviewPopover
                        message={campaign.message_text}
                        triggers={campaign.triggers}
                    >
                        <BodyCell innerClassName={css.anchorCell}>
                            <Link
                                className={css.anchor}
                                to={editLink}
                                onClick={(event) => {
                                    event.preventDefault()
                                    history.push(editLink, {
                                        previousSearch: window.location.search,
                                    })
                                }}
                            >
                                <div>
                                    <b>{campaign.name}</b>
                                </div>
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
                            onClickDelete={onClickDelete}
                            onClickDuplicate={onClickDuplicate}
                        />
                    </BodyCell>
                </TableBodyRow>
            )
        },
        [
            history,
            integration,
            onClickDelete,
            onClickDuplicate,
            onToggleCampaign,
            chatMultiLanguagesEnabled,
            defaultLanguage,
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
        </>
    )
}
