import { Icon } from '@gorgias/axiom'

import css from './TranslationLimit.less'

export function TranslationLimit() {
    return (
        <div className={css.translationLimit}>
            <Icon name="info" size={16} />
            <span className={css.translationLimitText}>
                Unable to regenerate
            </span>
        </div>
    )
}
