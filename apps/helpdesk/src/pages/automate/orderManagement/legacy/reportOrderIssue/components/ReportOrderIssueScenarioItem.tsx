import type { RefObject } from 'react'
import React from 'react'

import { useId } from '@repo/hooks'
import classnames from 'classnames'
import { useHistory, useLocation } from 'react-router-dom'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { SelfServiceReportIssueCase } from 'models/selfServiceConfiguration/types'
import type { DragItemRequired } from 'pages/common/hooks/useReorderDnD'
import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'

import css from './ReportOrderIssueScenarioItem.less'

type Props = {
    id: string
    position: number
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
    onMouseEnter: () => void
    onMouseLeave: () => void
    isDraggable: boolean
    item: SelfServiceReportIssueCase
}

type DragItem = { id: string } & DragItemRequired

const TARGET_TYPE = 'report-order-issue-scenario'

const ReportOrderIssueScenarioItem = ({
    id,
    position,
    onMove,
    onDrop,
    onCancel,
    onMouseEnter,
    onMouseLeave,
    isDraggable,
    item,
}: Props) => {
    const history = useHistory()
    const { pathname } = useLocation()
    const orderIssueIconId = 'order-issue-icon' + useId()
    const { dragRef, dropRef, handlerId, isDragging } = useReorderDnD<DragItem>(
        { id, type: TARGET_TYPE, position },
        [TARGET_TYPE],
        { onHover: onMove, onDrop, onCancel },
        isDraggable,
    )

    const handleClick = () => {
        history.push(`${pathname}/${position}`)
    }
    const isResponseNotConfiguredForAny = item.newReasons.some(
        (reason) =>
            !reason.action?.responseMessageContent.html &&
            !reason.action?.responseMessageContent.text,
    )
    return (
        <tr
            className={css.container}
            onClick={handleClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            {...(isDraggable
                ? {
                      ref: dropRef as RefObject<HTMLTableRowElement>,
                      style: { opacity: isDragging ? 0 : 1 },
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
            <td className={css.orderIssueIcon}>
                {isResponseNotConfiguredForAny && (
                    <>
                        <Tooltip
                            aria-label="Tooltip for response not configured"
                            placement="top-start"
                            target={orderIssueIconId}
                            trigger={['hover']}
                        >
                            Responses are not configured for all issue options
                            in this scenario.
                        </Tooltip>
                        <i
                            aria-label="Icon for response not configured"
                            id={orderIssueIconId}
                            className={'material-icons'}
                        >
                            error
                        </i>
                    </>
                )}
            </td>
            <td className={css.arrowRight}>
                <i className="material-icons md-2">keyboard_arrow_right</i>
            </td>
        </tr>
    )
}

export default ReportOrderIssueScenarioItem
