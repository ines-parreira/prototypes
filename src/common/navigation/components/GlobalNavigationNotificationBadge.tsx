import useCount from 'common/notifications/hooks/useCount'

import css from './GlobalNavigationNotificationBadge.less'

export function GlobalNavigationNotificationBadge() {
    const count = useCount()

    if (count === 0) return null

    const value = count > 99 ? '99+' : count

    const rightOffset = count > 99 ? 'l' : count > 9 ? 'm' : 's'

    return (
        <span data-right-offset={rightOffset} className={css.badge}>
            {value}
        </span>
    )
}
