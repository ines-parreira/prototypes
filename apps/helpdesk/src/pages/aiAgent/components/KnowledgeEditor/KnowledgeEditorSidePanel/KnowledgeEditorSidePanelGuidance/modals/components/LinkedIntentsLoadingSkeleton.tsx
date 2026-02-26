import { Skeleton } from '@gorgias/axiom'

import css from '../KnowledgeEditorSidePanelSectionLinkedIntentsModal.less'

const IntentRowSkeleton = () => (
    <div className={css.intentRowSkeleton}>
        <div className={css.intentInfoSkeleton}>
            <Skeleton width={24} height={24} />
            <Skeleton width={240} height={24} />
        </div>
        <Skeleton width={72} height={20} />
    </div>
)

export const LinkedIntentsLoadingSkeleton = () => (
    <div className={css.loadingState} aria-label="Loading intents">
        <div className={css.suggestedSection}>
            <div className={css.suggestedHeader}>
                <Skeleton width={16} height={16} />
                <Skeleton width={150} height={20} />
            </div>
            <div className={css.suggestedList}>
                <IntentRowSkeleton />
                <IntentRowSkeleton />
            </div>
        </div>

        <div className={css.group}>
            <div className={css.groupHeader}>
                <div className={css.intentInfoSkeleton}>
                    <Skeleton width={24} height={24} />
                    <Skeleton width={120} height={24} />
                </div>
                <Skeleton width={24} height={24} />
            </div>
            <div className={css.groupItems}>
                <IntentRowSkeleton />
                <IntentRowSkeleton />
                <IntentRowSkeleton />
            </div>
        </div>

        <div className={css.group}>
            <div className={css.groupHeader}>
                <div className={css.intentInfoSkeleton}>
                    <Skeleton width={24} height={24} />
                    <Skeleton width={140} height={24} />
                </div>
                <Skeleton width={24} height={24} />
            </div>
        </div>
    </div>
)
