import { Button, Quantity } from '@gorgias/axiom'

import { useNotificationsOverlay } from 'common/notifications'
import useCount from 'common/notifications/hooks/useCount'

import css from './NavigationSidebarNotificationsButton.less'

export function NavigationSidebarNotificationsButton() {
    const [, onToggle] = useNotificationsOverlay()
    const count = useCount()

    const rightOffset = count > 99 ? 'l' : count > 9 ? 'm' : 's'

    return (
        <div className={css.container}>
            <Button
                icon="comm-bell"
                variant="tertiary"
                onClick={onToggle}
                aria-label="Notifications"
                size="sm"
            ></Button>
            {count > 0 && (
                <div className={css.badge} data-right-offset={rightOffset}>
                    <Quantity quantity={count} maxQuantity={99} color="red" />
                </div>
            )}
        </div>
    )
}
