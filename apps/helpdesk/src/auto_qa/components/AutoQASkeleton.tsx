import { Skeleton } from '@gorgias/axiom'

import css from './AutoQASkeleton.less'

export default function AutoQASkeleton() {
    return (
        <div className={css.container}>
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton height={16} />
        </div>
    )
}
