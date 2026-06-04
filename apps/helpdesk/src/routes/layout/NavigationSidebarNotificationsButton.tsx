import {
    NavigationSidebarTooltip,
    useSidebarButtonSize,
} from '@repo/navigation'
import { useUnreadCount } from '@repo/notifications'

import { Button, Quantity, TooltipContent } from '@gorgias/axiom'

import css from './NavigationSidebarNotificationsButton.less'

const MAX_COUNT = 9

export function NavigationSidebarNotificationsButton() {
    const count = useUnreadCount()
    const buttonSize = useSidebarButtonSize()

    const rightOffset = count > MAX_COUNT ? 'm' : 's'

    return (
        <NavigationSidebarTooltip
            placement="bottom"
            trigger={
                <div className={css.container}>
                    <Button
                        icon="bell"
                        variant="tertiary"
                        aria-label="Notifications"
                        size={buttonSize}
                    />
                    {count > 0 && (
                        <div
                            className={css.badge}
                            data-right-offset={rightOffset}
                        >
                            <Quantity
                                quantity={count}
                                maxQuantity={MAX_COUNT}
                                color="red"
                                size="sm"
                            />
                        </div>
                    )}
                </div>
            }
        >
            <TooltipContent title="Notifications" />
        </NavigationSidebarTooltip>
    )
}
