import React, {RefObject, useEffect, useState} from 'react'
import classNames from 'classnames'

import {useReorderDnD} from 'pages/common/hooks/useReorderDnD'
import TextInput from 'pages/common/forms/input/TextInput'

import Tooltip from 'pages/common/components/Tooltip'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

import css from './ReplyButtonItem.less'

type ReplyButtonItemProps = {
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
    index: number
    label: string
    onChangeLabel: (label: string) => void
    onDeleteChoiceClick: (index: number) => void
    onDeleteChoiceConfirmation: (index: number) => void
    onDeleteChoiceCancel: (index: number) => void
    disabledTooltip?: React.ReactNode
}

const choiceTextLimit = 50

export default function ReplyButtonItem({
    onMove,
    onDrop,
    onCancel,
    index,
    label,
    onChangeLabel,
    onDeleteChoiceClick,
    onDeleteChoiceConfirmation,
    onDeleteChoiceCancel,
    disabledTooltip,
}: ReplyButtonItemProps) {
    const dndType = 'workflow-multiple-choices-reply-button'
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {position: index, type: dndType},
        [dndType],
        {onHover: onMove, onDrop, onCancel}
    )
    // don't bind the label from the reducer directly to the text input
    // to avoid cursor problems (change propagation is "too slow" for React to track the cursor position correctly while typing)
    const [textInputValue, setTextInputValue] = useState(label)

    useEffect(() => {
        onChangeLabel(textInputValue)
    }, [onChangeLabel, textInputValue])

    return (
        <div
            className={css.container}
            ref={dropRef as RefObject<HTMLDivElement>}
            style={{opacity: isDragging ? 0 : 1}}
            data-handler-id={handlerId}
        >
            <i
                className={classNames('material-icons', css.dragIcon)}
                ref={dragRef as RefObject<HTMLElement>}
            >
                drag_indicator
            </i>
            <TextInput
                value={textInputValue}
                onChange={setTextInputValue}
                className={css.textInput}
                maxLength={choiceTextLimit}
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
                cancelButtonProps={{intent: 'secondary'}}
                showCancelButton
            >
                {({uid, onDisplayConfirmation}) => (
                    <>
                        <i
                            id={uid}
                            className={classNames(
                                css.deleteIcon,
                                'material-icons clickable',
                                {
                                    [css.isDisabled]: !!disabledTooltip,
                                }
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
