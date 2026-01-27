import { Icon } from '@gorgias/axiom'

import type { SubmenuItemProps } from './types'

import css from './ShopifyMetafieldVariablePicker.less'

export function SubmenuItem({
    label,
    onClick,
    showChevron = true,
}: SubmenuItemProps) {
    return (
        <button type="button" onClick={onClick} className={css.navItem}>
            <span className={css.itemLabel}>{label}</span>
            {showChevron && <Icon name="arrow-chevron-right" />}
        </button>
    )
}
