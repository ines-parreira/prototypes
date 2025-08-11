import classNames from 'classnames'

import { Skeleton } from '@gorgias/axiom'

import css from './PendingTasksSection.less'

export type ExpanderProps = {
    isLoading: boolean
    isExpanded: boolean
    onClick: () => void
    controlId: string
}
export const Expander = ({
    isLoading,
    isExpanded,
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
            {isExpanded ? 'Show less' : 'Show all'}
            <i className={classNames('material-icons', css.expanderIcon)}>
                {isExpanded ? 'arrow_drop_up' : 'arrow_drop_down'}
            </i>
        </button>
    )
}
