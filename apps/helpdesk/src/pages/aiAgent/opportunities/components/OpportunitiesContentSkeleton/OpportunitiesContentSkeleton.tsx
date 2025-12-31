import { Skeleton } from '@gorgias/axiom'

import css from './OpportunitiesContentSkeleton.less'

export const OpportunitiesContentSkeleton = () => {
    return (
        <div className={css.opportunityDetails}>
            <div className={css.guidanceNameSection}>
                <Skeleton height={20} width={140} />
                <div className={css.guidanceNameSectionInput}>
                    <Skeleton height={20} />
                </div>
            </div>
            <div className={css.instructionsSection}>
                <Skeleton height={20} width={140} />
                <div className={css.instructionsSectionInput}>
                    <Skeleton height={20} />
                    <Skeleton height={20} />
                    <Skeleton height={20} />
                    <Skeleton height={20} width={250} />
                    <div className={css.instructionsSectionInputSeparator}>
                        &nbsp;
                    </div>
                    <Skeleton height={20} />
                    <Skeleton height={20} />
                    <Skeleton height={20} width={250} />
                </div>
            </div>
        </div>
    )
}
