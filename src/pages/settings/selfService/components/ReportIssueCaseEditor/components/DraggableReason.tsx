import React, {ReactElement} from 'react'
import classNames from 'classnames'

import {
    useReorderDnD,
    Callbacks,
} from '../../../../helpCenter/hooks/useReorderDnD'

import css from './DraggableReason.less'

interface ReportIssueCaseProps {
    reasonKey: string
    reasonLabel: string
    position: number
    onMoveEntity: Callbacks['onHover']
    onDeleteEntity: () => void
}

const Reason = ({
    reasonKey,
    reasonLabel,
    position,
    onMoveEntity,
    onDeleteEntity,
}: ReportIssueCaseProps): ReactElement => {
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position,
            id: reasonKey,
            type: `reason`,
        },
        [`reason`],
        {onHover: onMoveEntity}
    )

    return (
        <li
            className={css.reasonRow}
            key={reasonKey}
            ref={dropRef as React.RefObject<HTMLLIElement>}
            data-handler-id={handlerId}
            style={{opacity: isDragging ? 0 : 1}}
        >
            <div
                ref={dragRef as React.RefObject<HTMLDivElement>}
                className={classNames(css.dragIcon, 'material-icons')}
            >
                drag_indicator
            </div>

            <div className={classNames(css.reasonText, 'link-full-td')}>
                {reasonLabel}
            </div>

            <button
                type="button"
                className={css.deleteButton}
                onClick={onDeleteEntity}
            >
                <span className="icon material-icons">clear</span>
            </button>
        </li>
    )
}

export default Reason
