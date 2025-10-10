import { LegacyButton as Button } from '@gorgias/axiom'

import css from './RecommendationFilterNoResults.less'

type Props = {
    onResetButtonClick: () => void
}
export default function RecommendationFilterNoResults({
    onResetButtonClick,
}: Props) {
    return (
        <div className={css.container}>
            <span className={css.header}>No results</span>
            <span className={css.description}>
                There are no article recommendations match your current filters.
            </span>
            <div>
                <Button onClick={onResetButtonClick} fillStyle="ghost">
                    Reset filters
                </Button>
            </div>
        </div>
    )
}
