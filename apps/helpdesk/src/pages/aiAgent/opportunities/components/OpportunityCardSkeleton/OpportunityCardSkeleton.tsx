import { Skeleton } from '@gorgias/axiom'

import css from './OpportunityCardSkeleton.less'

export const OpportunityCardSkeleton = () => {
    return (
        <div className={css.card}>
            <Skeleton height={20} />
            <Skeleton height={16} />
        </div>
    )
}
