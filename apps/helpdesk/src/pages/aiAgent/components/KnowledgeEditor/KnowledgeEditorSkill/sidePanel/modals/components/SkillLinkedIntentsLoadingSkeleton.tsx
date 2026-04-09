import { Skeleton } from '@gorgias/axiom'

import css from '../SkillLinkedIntentsModal.less'

const IntentRowSkeleton = () => (
    <div className={css.intentRowSkeleton}>
        <div className={css.intentInfoSkeleton}>
            <Skeleton width={240} height={20} />
        </div>
        <Skeleton width={72} height={20} />
    </div>
)

export const SkillLinkedIntentsLoadingSkeleton = () => (
    <div className={css.loadingState} aria-label="Loading intents">
        <div className={css.group}>
            <div className={css.groupHeader}>
                <Skeleton width={120} height={16} />
                <Skeleton width={24} height={24} />
            </div>
            <div className={css.groupItems}>
                <IntentRowSkeleton />
                <IntentRowSkeleton />
                <IntentRowSkeleton />
            </div>
        </div>
    </div>
)
