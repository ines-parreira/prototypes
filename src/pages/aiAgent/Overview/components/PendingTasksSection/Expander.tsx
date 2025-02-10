import {Skeleton} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React from 'react'

import css from './PendingTasksSection.less'

export type ExpanderProps = {
    isLoading: boolean
    isExpanded: boolean
    onClick: () => void
    controlId: string
    tasksCount?: number
}
export const Expander = ({
    isLoading,
    isExpanded,
    tasksCount,
    onClick,
    controlId,
}: ExpanderProps) => {
    return isLoading ? (
        <div className={css.expander}>
            <Skeleton height={14} width={150} />
        </div>
    ) : (
        <button
            className={css.expander}
            onClick={onClick}
            aria-expanded={isExpanded}
            aria-controls={controlId}
        >
            {isExpanded
                ? 'Collapse'
                : `Show all tasks (${tasksCount ?? 0} total)`}
            <i className={classNames('material-icons', css.titleIcon)}>
                {isExpanded ? 'arrow_drop_up' : 'arrow_drop_down'}
            </i>
        </button>
    )
}
