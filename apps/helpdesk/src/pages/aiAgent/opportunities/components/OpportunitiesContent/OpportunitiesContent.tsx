import { OpportunitiesEmptyState } from '../OpportunitiesEmptyState/OpportunitiesEmptyState'

import css from './OpportunitiesContent.less'

export const OpportunitiesContent = () => {
    return (
        <div className={css.containerContent}>
            <div className={css.header}>
                <h3 className={css.title}>Opportunities</h3>
            </div>
            <div className={css.contentBody}>
                <OpportunitiesEmptyState />
            </div>
        </div>
    )
}
