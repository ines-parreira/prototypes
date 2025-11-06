import cn from 'classnames'

import { Skeleton } from '@gorgias/axiom'

import css from './OpportunityCardSkeleton.less'

export type OpportunityCardSkeletonProps = {
    cardContainerClassName?: string
}

export const OpportunityCardSkeleton = ({
    cardContainerClassName,
}: OpportunityCardSkeletonProps) => {
    return (
        <div className={cn(css.card, cardContainerClassName)}>
            <div className={css.header}>
                <Skeleton width={20} height={20} />
            </div>
            <div className={css.infoSection}>
                <Skeleton height={20} />
                <Skeleton height={16} />
            </div>
        </div>
    )
}
