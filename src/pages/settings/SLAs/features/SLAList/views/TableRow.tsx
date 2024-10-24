import classnames from 'classnames'
import _noop from 'lodash/noop'
import React, {Ref, RefObject} from 'react'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import {useReorderDnD} from 'pages/common/hooks/useReorderDnD'
import {
    OnDropPolicyFn,
    OnMovePolicyFn,
    OnTogglePolicyFn,
    PolicyDragItem,
    TableColumn,
    UISLAPolicy,
} from 'pages/settings/SLAs/features/SLAList/types'

import CellLinkWrapper from './CellLinkWrapper'
import {columnOrder, getTableCell} from './config'
import css from './TableRow.less'

type TableRowProps = {
    policy: UISLAPolicy
    onToggle: OnTogglePolicyFn
    dragItem: PolicyDragItem
    onMovePolicy: OnMovePolicyFn
    onDropPolicy: OnDropPolicyFn
    isSubmitting: boolean
}
export default function TableRow({
    policy,
    onToggle,
    dragItem,
    onMovePolicy,
    onDropPolicy,
    isSubmitting,
}: TableRowProps) {
    const {dragRef, dropRef, handlerId, isDragging} =
        useReorderDnD<PolicyDragItem>(
            dragItem,
            [dragItem.type],
            {
                onHover: onMovePolicy,
                onDrop: onDropPolicy,
            },
            !isSubmitting
        )

    const opacity = isDragging ? 0.5 : 1

    return (
        <TableBodyRow
            ref={dropRef as Ref<HTMLTableRowElement>}
            data-handler-id={handlerId}
            className={css.tableRow}
            style={{
                opacity,
            }}
        >
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
                        dragRef: dragRef as RefObject<HTMLElement>,
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
