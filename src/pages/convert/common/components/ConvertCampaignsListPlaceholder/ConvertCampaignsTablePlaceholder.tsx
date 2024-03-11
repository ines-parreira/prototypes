import React, {useMemo} from 'react'
import classnames from 'classnames'

import TableWrapper from 'pages/common/components/table/TableWrapper'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import ToggleInput from 'pages/common/forms/ToggleInput'

import {Campaign} from '../../../campaigns/types/Campaign'
import {useSortedCampaigns} from '../../../campaigns/hooks/useSortedCampaigns'
import {isActiveStatus} from '../../../campaigns/types/enums/CampaignStatus.enum'

import css from './ConvertCampaignsTablePlaceholder.less'

type Props = {
    data: Campaign[]
    perPage?: number
}

const ConvertCampaignsTablePlaceholder = ({data, perPage = 25}: Props) => {
    const {sortedCampaigns} = useSortedCampaigns(data)

    const renderRows = (campaign: Campaign) => {
        return (
            <TableBodyRow key={campaign.id} className={css.tableRow}>
                <BodyCell style={{width: 88}}>
                    <ToggleInput
                        isToggled={isActiveStatus(campaign.status)}
                        aria-label={`Campaign status for ${campaign.name}`}
                        isDisabled={true}
                    />
                </BodyCell>

                <BodyCell innerClassName={css.nameCell}>
                    <div>
                        <b>{campaign.name}</b>
                    </div>
                </BodyCell>
            </TableBodyRow>
        )
    }

    const paginatedRows = useMemo(
        () => sortedCampaigns.slice(0, perPage),
        [perPage, sortedCampaigns]
    )

    return (
        <>
            <TableWrapper
                className={classnames(
                    'table-integrations',
                    'mt-3',
                    css.campaignsTable
                )}
            >
                <TableBody>{paginatedRows.map(renderRows)}</TableBody>
            </TableWrapper>
        </>
    )
}

export default ConvertCampaignsTablePlaceholder
