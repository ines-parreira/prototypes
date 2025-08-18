import { Skeleton } from '@gorgias/axiom'

import css from './OpportunityCardSkeleton.less'

export const OpportunityCardSkeleton = () => {
    return (
        <div className={css.card}>
            <div className={css.header}>
                <Skeleton width={180} height={16} />
            </div>
            <div className={css.infoSection}>
                <Skeleton width={18} height={18} circle />
                <Skeleton width={120} height={14} />
            </div>
        </div>
    )
}
