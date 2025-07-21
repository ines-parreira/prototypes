import { Skeleton } from '@gorgias/merchant-ui-kit'

import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'

export const KnowledgeSourceFeedbackSkeleton = () => {
    return (
        <div className={css.skeletonContainer}>
            <Skeleton width={20} height={20} circle />
            <Skeleton width={'100%'} height={24} />
            <Skeleton width={24} height={24} />
            <Skeleton width={24} height={24} />
        </div>
    )
}
