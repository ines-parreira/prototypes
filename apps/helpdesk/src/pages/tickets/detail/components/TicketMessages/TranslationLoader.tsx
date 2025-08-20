import { LoadingSpinner } from '@gorgias/axiom'

import css from './TranslationLoader.less'

export function TranslationLoader() {
    return (
        <div className={css.translationLoader}>
            <LoadingSpinner size="small" className={css.loadingSpinner} />
            <span className={css.loadingText}>Translating...</span>
        </div>
    )
}
