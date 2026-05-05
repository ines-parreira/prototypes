import {
    NavigationSidebarTooltip,
    useSidebarButtonSize,
} from '@repo/navigation'

import { Button, Quantity, TooltipContent } from '@gorgias/axiom'

import useCount from 'common/notifications/hooks/useCount'

import css from './NavigationSidebarNotificationsButton.less'

export function NavigationSidebarNotificationsButton() {
    const count = useCount()
    const buttonSize = useSidebarButtonSize()

    const rightOffset = count > 99 ? 'l' : count > 9 ? 'm' : 's'

    return (
        <NavigationSidebarTooltip
            placement="bottom"
            trigger={
                <div className={css.container}>
                    <Button
                        icon="comm-bell"
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
                                maxQuantity={99}
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
