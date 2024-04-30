import React from 'react'
import classnames from 'classnames'

import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    TableColumn,
    UISLAPolicy,
} from 'pages/settings/SLAs/features/SLAList/types'

import CellLinkWrapper from './CellLinkWrapper'
import {columnOrder, getTableCell} from './config'
import css from './TableRow.less'

export default function TableRow({policy}: {policy: UISLAPolicy}) {
    return (
        <TableBodyRow className={css.tableRow}>
            {columnOrder.map((column) => (
                <React.Fragment key={`${column}-${policy.uuid}`}>
                    {React.createElement(getTableCell(column), {
                        policy,
                        bodyCellProps: {
                            ...(column !== TableColumn.PolicyName && {
                                innerClassName: css.cellContent,
                            }),
                        },
                    })}
                </React.Fragment>
            ))}
            <BodyCell>
                <CellLinkWrapper to={`/app/settings/sla/${policy.uuid}`}>
                    <i className={classnames('material-icons', css.goToIcon)}>
                        chevron_right
                    </i>
                </CellLinkWrapper>
            </BodyCell>
        </TableBodyRow>
    )
}
