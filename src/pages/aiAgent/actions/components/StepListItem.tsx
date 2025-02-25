import React, { RefObject } from 'react'

import classNames from 'classnames'

import { ActionTemplate, App } from 'pages/automate/actionsPlatform/types'
import ReusableLLMPromptCallNodeStatusLabel from 'pages/automate/workflows/components/ReusableLLMPromptCallNodeStatusLabel'
import ReusableLLMPromptCallNodeLabel from 'pages/automate/workflows/editor/visualBuilder/nodes/ReusableLLMPromptCallNodeLabel'
import IconButton from 'pages/common/components/button/IconButton'
import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'

import css from './StepListItem.less'

export type StepListItemProps = {
    index: number
    step: ActionTemplate
    onDelete: () => void
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
    onClick: () => void
    app: App
    isClickable: boolean
    hasMissingCredentials: boolean
    hasCredentials: boolean
    hasAllValues: boolean
    hasMissingValues: boolean
}

export const StepListItem = ({
    index,
    step,
    onDelete,
    onMove,
    onDrop,
    onCancel,
    onClick,
    app,
    isClickable,
    hasMissingCredentials,
    hasCredentials,
    hasAllValues,
    hasMissingValues,
}: StepListItemProps) => {
    const type = `steps`
    const { dragRef, dropRef, handlerId, isDragging } = useReorderDnD(
        { type, position: index },
        [type],
        { onHover: onMove, onDrop, onCancel },
    )

    return (
        <li
            data-handler-id={handlerId}
            ref={dropRef as RefObject<HTMLLIElement>}
            style={{ opacity: isDragging ? 0 : 1 }}
            className={classNames(css.container, {
                [css.isClickable]: isClickable,
            })}
            onClick={isClickable ? onClick : undefined}
        >
            <i
                className={classNames('material-icons', css.dragIcon)}
                ref={dragRef as RefObject<HTMLButtonElement>}
            >
                drag_indicator
            </i>
            <ReusableLLMPromptCallNodeLabel app={app} name={step.name} />
            <ReusableLLMPromptCallNodeStatusLabel
                hasMissingCredentials={hasMissingCredentials}
                hasCredentials={hasCredentials}
                hasAllValues={hasAllValues}
                hasMissingValues={hasMissingValues}
            />
            <IconButton
                fillStyle="ghost"
                intent="destructive"
                onClick={onDelete}
                className={css.deleteButton}
            >
                close
            </IconButton>
        </li>
    )
}
