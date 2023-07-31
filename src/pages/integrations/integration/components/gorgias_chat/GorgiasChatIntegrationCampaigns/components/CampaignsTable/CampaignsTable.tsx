import React, {MouseEvent, useCallback, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Map} from 'immutable'

import {IntegrationType} from 'models/integration/constants'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import ToggleInput from 'pages/common/forms/ToggleInput'
import TableHead from 'pages/common/components/table/TableHead'
import {NumberedPagination} from 'pages/common/components/Paginations/NumberedPagination'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'

import {ChatCampaign} from '../../types/Campaign'

import {CampaignPreviewPopover} from '../CampaignPreviewPopover'

import {CampaignToolsCell} from './components/CampaignToolsCell'

import css from './CampaignsTable.less'

type Props = {
    data: ChatCampaign[]
    integration: Map<any, any>
    perPage?: number
    onClickDelete: (campaign: ChatCampaign) => void
    onClickDuplicate: (event: MouseEvent, campaign: ChatCampaign) => void
    onToggleCampaign: (campaign: ChatCampaign) => void
}

export const CampaignsTable = ({
    data,
    integration,
    perPage = 25,
    onClickDelete,
    onClickDuplicate,
    onToggleCampaign,
}: Props) => {
    const [page, setPage] = useState(1)

    const paginatedRows = useMemo(() => {
        const start = (page - 1) * perPage
        const end = start + perPage

        return data.slice(start, end)
    }, [data, page, perPage])

    const renderRows = useCallback(
        (campaign: ChatCampaign, index: number) => {
            const editLink =
                `/app/settings/channels/${IntegrationType.GorgiasChat}/` +
                `${integration.get('id') as number}/campaigns/${campaign.id}`

            return (
                <TableBodyRow key={index} className={css.tableRow}>
                    <BodyCell style={{width: 88}}>
                        <ToggleInput
                            isToggled={!campaign?.deactivated_datetime}
                            onClick={() => onToggleCampaign(campaign)}
                            aria-label={`Enable campaign ${campaign.name}`}
                        />
                    </BodyCell>
                    <CampaignPreviewPopover
                        message={campaign.message.text}
                        triggers={campaign.triggers}
                    >
                        <BodyCell innerClassName={css.anchorCell}>
                            <Link className={css.anchor} to={editLink}>
                                <div>
                                    <b>{campaign.name}</b>
                                </div>
                            </Link>
                        </BodyCell>
                    </CampaignPreviewPopover>
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
        [integration, onClickDelete, onClickDuplicate, onToggleCampaign]
    )

    const renderTableBody = useCallback(() => {
        return paginatedRows.map(renderRows)
    }, [paginatedRows, renderRows])

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
                    <HeaderCellProperty title="Campaign name" />
                    <HeaderCellProperty title="" style={{width: 110}} />
                </TableHead>
                <TableBody>{renderTableBody()}</TableBody>
            </TableWrapper>
            {data.length > perPage && (
                <NumberedPagination
                    className={css.pagination}
                    count={Math.ceil(data.length / perPage)}
                    page={page}
                    onChange={setPage}
                />
            )}
        </>
    )
}
