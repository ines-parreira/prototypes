import { Skeleton } from '@gorgias/axiom'

import css from './TicketSkeleton.less'

export default function TicketSkeleton() {
    return (
        <div className={css.container}>
            <Skeleton height={24} className={css.icon} />
            <div className={css.info}>
                <Skeleton height={20} />
                <Skeleton height={16} />
            </div>
        </div>
    )
}
