import React from 'react'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {
    OnTogglePolicyFn,
    TableColumn,
    UISLAPolicy,
} from 'pages/settings/SLAs/features/SLAList/types'

import CellLinkWrapper from './CellLinkWrapper'
import {columnOrder, getTableCell} from './config'
import css from './TableRow.less'

type TableRowProps = {
    policy: UISLAPolicy
    onToggle: OnTogglePolicyFn
}
export default function TableRow({policy, onToggle}: TableRowProps) {
    return (
        <TableBodyRow className={css.tableRow}>
            {columnOrder.map((column) => (
                <React.Fragment key={`${column}-${policy.uuid}`}>
                    {React.createElement(getTableCell(column), {
                        policy,
                        onToggle: onToggle || _noop,
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
