import type { RefObject } from 'react'

import classnames from 'classnames'
import { useHistory, useLocation } from 'react-router-dom'

import { Box, Icon, Text, Tooltip, TooltipContent } from '@gorgias/axiom'

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
    isDraggable: boolean
    scenario: SelfServiceReportIssueCase
}

type DragItem = { id: string } & DragItemRequired

const TARGET_TYPE = 'report-order-issue-scenario'

export const ReportOrderIssueScenarioItem = ({
    id,
    position,
    onMove,
    onDrop,
    onCancel,
    isDraggable,
    scenario,
}: Props) => {
    const history = useHistory()
    const { pathname } = useLocation()
    const { dragRef, dropRef, handlerId, isDragging } = useReorderDnD<DragItem>(
        { id, type: TARGET_TYPE, position },
        [TARGET_TYPE],
        { onHover: onMove, onDrop, onCancel },
        isDraggable,
    )

    const handleClick = () => {
        history.push(`${pathname}/${position}`)
    }

    const isResponseNotConfiguredForAny = scenario.newReasons.some(
        (reason) =>
            !reason.action?.responseMessageContent.html &&
            !reason.action?.responseMessageContent.text,
    )

    return (
        <button
            className={css.container}
            onClick={handleClick}
            type="button"
            {...(isDraggable
                ? {
                      ref: dropRef as RefObject<HTMLButtonElement>,
                      style: { opacity: isDragging ? 0 : 1 },
                      'data-handler-id': handlerId,
                  }
                : {})}
        >
            <div
                ref={dragRef as RefObject<HTMLDivElement>}
                className={classnames(css.dragHandle, {
                    [css.isDraggable]: isDraggable,
                })}
            >
                {isDraggable && (
                    <Icon name="drag-vertical" alt="Drag to reorder" />
                )}
            </div>
            <Box
                flexGrow={1}
                minWidth={0}
                flexDirection="column"
                gap="xxs"
                p="sm"
            >
                <Text variant="medium">{scenario.title}</Text>
                <Text size="sm" color="var(--content-neutral-secondary)">
                    {scenario.description}
                </Text>
            </Box>
            {isResponseNotConfiguredForAny && (
                <Tooltip
                    trigger={
                        <div className={css.warningIcon}>
                            <Icon
                                name="warning-triangle"
                                alt="Responses not fully configured"
                            />
                        </div>
                    }
                >
                    <TooltipContent title="Responses are not configured for all issue options in this scenario." />
                </Tooltip>
            )}
            <div className={css.chevron}>
                <Icon name="arrow-chevron-right" alt="" />
            </div>
        </button>
    )
}
