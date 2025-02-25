import React, { useMemo } from 'react'

import classnames from 'classnames'

import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import ToggleInput from 'pages/common/forms/ToggleInput'

import { useSortedCampaigns } from '../../../campaigns/hooks/useSortedCampaigns'
import { Campaign } from '../../../campaigns/types/Campaign'
import { isActiveStatus } from '../../../campaigns/types/enums/CampaignStatus.enum'

import css from './ConvertCampaignsTablePlaceholder.less'

type Props = {
    data: Campaign[]
    isLoading: boolean
    perPage?: number
}

const ConvertCampaignsTablePlaceholder = ({
    data,
    isLoading,
    perPage = 25,
}: Props) => {
    const { sortedCampaigns } = useSortedCampaigns(data)

    const renderRows = (campaign: Campaign) => {
        return (
            <TableBodyRow key={campaign.id} className={css.tableRow}>
                <BodyCell style={{ width: 88 }}>
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
        [perPage, sortedCampaigns],
    )

    return (
        <>
            <TableWrapper
                className={classnames(
                    'table-integrations',
                    'mt-3',
                    css.campaignsTable,
                )}
            >
                <TableBody>
                    {!isLoading && paginatedRows.map(renderRows)}
                    {isLoading && (
                        <SkeletonLoader className={css.loader} length={10} />
                    )}
                </TableBody>
            </TableWrapper>
        </>
    )
}

export default ConvertCampaignsTablePlaceholder
