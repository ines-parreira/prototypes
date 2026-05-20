import { Skeleton } from '@gorgias/axiom'

import css from './GorgiasChatCreationWizardSkeleton.less'

export const GorgiasChatCreationWizardSkeleton = () => {
    return (
        <div className={css.page}>
            <div className={css.pageHeader}>
                <Skeleton height="16px" width="120px" />
            </div>
            <div className={css.wizard}>
                <div className={css.content}>
                    <div className={css.stepper}>
                        <Skeleton height="20px" width="140px" />
                        <Skeleton height="20px" width="120px" />
                        <Skeleton height="20px" width="160px" />
                        <Skeleton height="20px" width="130px" />
                    </div>
                    <Skeleton height="480px" />
                    <div className={css.footer}>
                        <Skeleton height="36px" width="80px" />
                        <Skeleton height="36px" width="100px" />
                    </div>
                </div>
            </div>
        </div>
    )
}
