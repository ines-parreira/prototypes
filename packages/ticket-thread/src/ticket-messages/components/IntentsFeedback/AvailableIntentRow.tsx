import { humanize } from '@repo/utils'

import { Icon } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from './IntentsFeedback.less'

type AvailableIntentRowProps = {
    name: string
    description: string | undefined
    isDisabled: boolean
    onAdd: () => void
}

export function AvailableIntentRow({
    name,
    description,
    isDisabled,
    onAdd,
}: AvailableIntentRowProps) {
    return (
        <div
            className={`${css.intentRow} ${css.hoverable} ${isDisabled ? css.disabled : ''}`}
            onClick={() => {
                if (!isDisabled) onAdd()
            }}
        >
            <div className={css.intentLabel}>
                <span className={css.action}>
                    <button
                        className={css.actionButton}
                        disabled={isDisabled}
                        type="button"
                        aria-label={`Add ${name}`}
                    >
                        <Icon name={'add-plus-circle' as IconName} size="xs" />
                    </button>
                </span>
                <span className={css.label}>{humanize(name)}</span>
            </div>
            {description && (
                <div className={css.description} title={description}>
                    {description}
                </div>
            )}
        </div>
    )
}
