import { logEvent, SegmentEvent } from '@repo/logging'
import { useSidebarButtonSize } from '@repo/navigation'
import { isMacOs } from '@repo/utils'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useSpotlightContext } from 'providers/ui/SpotlightContext'

export function NavigationSidebarSpotlightButton() {
    const { isOpen, setIsOpen } = useSpotlightContext()
    const buttonSize = useSidebarButtonSize()

    const handleClick = () => {
        logEvent(SegmentEvent.GlobalSearchOpenButtonClick)
        setIsOpen(!isOpen)
    }

    return (
        <Tooltip
            placement="bottom"
            trigger={
                <Button
                    variant="tertiary"
                    onClick={handleClick}
                    icon="search-magnifying-glass"
                    size={buttonSize}
                />
            }
        >
            <TooltipContent shortcut={(isMacOs ? '⌘' : 'CTRL') + 'K'} />
        </Tooltip>
    )
}
