import { OpportunitiesContent } from '../OpportunitiesContent/OpportunitiesContent'
import { OpportunitiesSidebar } from '../OpportunitiesSidebar/OpportunitiesSidebar'

import css from './OpportunitiesLayout.less'

export const OpportunitiesLayout = () => {
    return (
        <div
            className={css.wrapper}
            data-overflow="visible"
            data-ai-opportunities
        >
            <div className={css.layout}>
                <OpportunitiesSidebar />
                <OpportunitiesContent />
            </div>
        </div>
    )
}
