import React, {ComponentProps, useRef} from 'react'

import {formatPercentage} from 'pages/common/utils/numbers'

import Tooltip from 'pages/common/components/Tooltip'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import MoneyAmount from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/MoneyAmount'

import {getDataFromTableCell} from 'pages/stats/convert/utils/getDataFromTableCell'

import {CampaignTableKeys} from 'pages/stats/convert/types/enums/CampaignTableKeys.enum'
import {CampaignTableContentCell} from 'pages/stats/convert/types/CampaignTableContentCell'

type Props = ComponentProps<typeof BodyCell> & {
    cell: CampaignTableContentCell
    data: any
}

export const TotalRevenueCell = ({cell, data, ...props}: Props) => {
    const contentRef = useRef(null)
    const totalShare = getDataFromTableCell(
        cell,
        CampaignTableKeys.TotalRevenueShare
    ) as number

    return (
        <BodyCell {...props}>
            <>
                <div ref={contentRef}>
                    <MoneyAmount
                        renderIfZero
                        amount={data}
                        currencyCode={cell.currency}
                        currencyDisplay="narrowSymbol"
                    />
                </div>
                <Tooltip target={contentRef}>
                    Store revenue share: {formatPercentage(totalShare)}
                </Tooltip>
            </>
        </BodyCell>
    )
}
