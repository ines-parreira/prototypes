import {
    NavigationSidebarTooltip,
    useSidebarButtonSize,
} from '@repo/navigation'
import { isMacOs } from '@repo/utils'

import { Button, TooltipContent } from '@gorgias/axiom'

import { useSpotlightContext } from 'providers/ui/SpotlightContext'

export function NavigationSidebarSpotlightButton() {
    const { isOpen, setIsOpen } = useSpotlightContext()
    const buttonSize = useSidebarButtonSize()

    const handleClick = () => {
        setIsOpen(!isOpen)
    }

    return (
        <NavigationSidebarTooltip
            placement="bottom"
            trigger={
                <Button
                    variant="tertiary"
                    onClick={handleClick}
                    icon="magnifying-glass"
                    size={buttonSize}
                />
            }
        >
            <TooltipContent
                shortcut={(isMacOs ? '⌘' : 'CTRL') + 'K'}
                title="Search"
            />
        </NavigationSidebarTooltip>
    )
}
