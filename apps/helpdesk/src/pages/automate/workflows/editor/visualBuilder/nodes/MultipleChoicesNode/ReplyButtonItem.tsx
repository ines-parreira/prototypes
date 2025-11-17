import type { RefObject } from 'react'
import type React from 'react'
import { useEffect, useState } from 'react'

import classNames from 'classnames'
import type Editor from 'draft-js-plugins-editor'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import TextInputWithVariables from 'pages/automate/workflows/editor/visualBuilder/components/variables/TextInputWithVariables'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import type { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'

import css from './ReplyButtonItem.less'

type ReplyButtonItemProps = {
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
    index: number
    eventId: string
    label: string
    onChangeLabel: (label: string) => void
    onDeleteChoiceClick: (index: number) => void
    onDeleteChoiceConfirmation: (index: number) => void
    onDeleteChoiceCancel: (index: number) => void
    disabledTooltip?: React.ReactNode
    placeholder?: string
    workflowVariables: WorkflowVariableList
    error?: string
    onBlur?: () => void
}

export default function ReplyButtonItem({
    onMove,
    onDrop,
    onCancel,
    index,
    eventId,
    label,
    onChangeLabel,
    onDeleteChoiceClick,
    onDeleteChoiceConfirmation,
    onDeleteChoiceCancel,
    disabledTooltip,
    placeholder,
    workflowVariables,
    error,
    onBlur,
}: ReplyButtonItemProps) {
    const [ref, setRef] = useState<Editor | null>(null)
    const { visualBuilderGraph, dispatch } = useVisualBuilderContext()
    const dndType = 'workflow-multiple-choices-reply-button'
    const { dragRef, dropRef, handlerId, isDragging } = useReorderDnD(
        { position: index, type: dndType },
        [dndType],
        { onHover: onMove, onDrop, onCancel },
    )

    useEffect(() => {
        if (eventId === visualBuilderGraph.choiceEventIdEditing) {
            ref?.focus()
        }
    }, [ref, eventId, visualBuilderGraph.choiceEventIdEditing])

    return (
        <div
            className={css.container}
            ref={dropRef as RefObject<HTMLDivElement>}
            style={{ opacity: isDragging ? 0 : 1 }}
            data-handler-id={handlerId}
        >
            <i
                className={classNames('material-icons', css.dragIcon)}
                ref={dragRef as RefObject<HTMLElement>}
            >
                drag_indicator
            </i>
            <TextInputWithVariables
                ref={setRef}
                value={label}
                onChange={onChangeLabel}
                placeholder={placeholder}
                onFocus={() => {
                    dispatch({
                        type: 'SET_CHOICE_EVENT_EDITING_ID',
                        eventId,
                    })
                }}
                onBlur={() => {
                    dispatch({
                        type: 'SET_CHOICE_EVENT_EDITING_ID',
                        eventId: null,
                    })
                    onBlur?.()
                }}
                variables={workflowVariables}
                error={error}
            />
            <ConfirmationPopover
                placement="top"
                buttonProps={{
                    intent: 'destructive',
                }}
                title="Delete answer and children?"
                content="Deleting this answer will also delete any steps added below and cannot be undone"
                onConfirm={() => {
                    onDeleteChoiceConfirmation(index)
                }}
                onCancel={() => {
                    onDeleteChoiceCancel(index)
                }}
                cancelButtonProps={{ intent: 'secondary' }}
                showCancelButton
            >
                {({ uid, onDisplayConfirmation }) => (
                    <>
                        <i
                            id={uid}
                            className={classNames(
                                css.deleteIcon,
                                'material-icons clickable',
                                {
                                    [css.isDisabled]: !!disabledTooltip,
                                },
                            )}
                            onClick={() => {
                                if (!disabledTooltip) {
                                    onDeleteChoiceClick(index)
                                    onDisplayConfirmation()
                                }
                            }}
                        >
                            close
                        </i>
                        {disabledTooltip && (
                            <Tooltip placement="top-start" target={uid}>
                                {disabledTooltip}
                            </Tooltip>
                        )}
                    </>
                )}
            </ConfirmationPopover>
        </div>
    )
}
