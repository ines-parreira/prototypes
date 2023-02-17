import React, {RefObject} from 'react'
import classnames from 'classnames'
import {useHistory, useLocation} from 'react-router-dom'

import {SelfServiceReportIssueCase} from 'models/selfServiceConfiguration/types'
import {DragItemRequired, useReorderDnD} from 'pages/common/hooks/useReorderDnD'

import css from './ReportOrderIssueScenarioItem.less'

type Props = {
    id: string
    position: number
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
    isDraggable: boolean
    item: SelfServiceReportIssueCase
}

type DragItem = {id: string} & DragItemRequired

const TARGET_TYPE = 'report-order-issue-scenario'

const ReportOrderIssueScenarioItem = ({
    id,
    position,
    onMove,
    onDrop,
    onCancel,
    isDraggable,
    item,
}: Props) => {
    const history = useHistory()
    const {pathname} = useLocation()

    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD<DragItem>(
        {id, type: TARGET_TYPE, position},
        [TARGET_TYPE],
        {onHover: onMove, onDrop, onCancel},
        isDraggable
    )

    const handleClick = () => {
        history.push(`${pathname}/${position}`)
    }

    return (
        <tr
            className={css.container}
            onClick={handleClick}
            {...(isDraggable
                ? {
                      ref: dropRef as RefObject<HTMLTableRowElement>,
                      style: {opacity: isDragging ? 0 : 1},
                      'data-handler-id': handlerId,
                  }
                : {})}
        >
            <td
                ref={dragRef as RefObject<HTMLTableCellElement>}
                className={classnames(css.dragHandle, {
                    [css.isDraggable]: isDraggable,
                })}
            >
                {isDraggable && (
                    <i className="material-icons md-2">drag_indicator</i>
                )}
            </td>
            <td className={css.title}>{item.title}</td>
            <td className={css.description}>{item.description}</td>
            <td className={css.arrowRight}>
                <i className="material-icons md-2">keyboard_arrow_right</i>
            </td>
        </tr>
    )
}

export default ReportOrderIssueScenarioItem
