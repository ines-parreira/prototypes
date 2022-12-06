import React from 'react'
import classNames from 'classnames'

import TextInput from 'pages/common/forms/input/TextInput'
import {
    Callbacks,
    useReorderDnD,
} from 'pages/settings/helpCenter/hooks/useReorderDnD'

import css from './SubjectLine.less'

export type SubjectLineProps = {
    onDelete: () => void
    onChange: (nextValue: string) => void
    onMoveEntity: Callbacks['onHover']
    onDropEntity?: Callbacks['onDrop']
    position: number
    value: string
}

const SubjectLine = ({
    value,
    onDelete,
    onChange,
    position,
    onMoveEntity,
    onDropEntity,
}: SubjectLineProps) => {
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position,
            type: `SUBJECT_LINES`,
        },
        [`SUBJECT_LINES`],
        {onHover: onMoveEntity, onDrop: onDropEntity}
    )

    const opacity = isDragging ? 0 : 1

    return (
        <div
            className={css.wrapper}
            ref={dropRef as React.Ref<HTMLDivElement>}
            data-handler-id={handlerId}
            style={{opacity}}
        >
            <div ref={dragRef as React.Ref<HTMLDivElement>}>
                <i className={classNames('material-icons', css.dragIndicator)}>
                    drag_indicator
                </i>
            </div>
            <TextInput value={value} onChange={onChange} />
            <i
                className={classNames('material-icons', css.deleteIcon)}
                onClick={onDelete}
            >
                delete
            </i>
        </div>
    )
}

export default SubjectLine
