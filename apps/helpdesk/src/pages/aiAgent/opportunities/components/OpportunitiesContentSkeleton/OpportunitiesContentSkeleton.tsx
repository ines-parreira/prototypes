import { Skeleton } from '@gorgias/axiom'

import css from './OpportunitiesContentSkeleton.less'

export const OpportunitiesContentSkeleton = () => {
    return (
        <div className={css.opportunityDetails}>
            <div className={css.opportunityCard}>
                <Skeleton height={20} />
                <Skeleton height={40} />
            </div>
            <div className={css.guidanceNameSection}>
                <Skeleton height={20} width={140} />
                <div className={css.guidanceNameSectionInput}>
                    <Skeleton height={20} />
                </div>
                <Skeleton height={16} width={488} />
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
                <Skeleton height={16} width={372} />
                <div className={css.instructionsSectionBottomSeparator}>
                    &nbsp;
                </div>
                <Skeleton height={20} width={195} />
            </div>
        </div>
    )
}
