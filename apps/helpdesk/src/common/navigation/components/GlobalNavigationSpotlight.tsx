import { logEvent, SegmentEvent } from '@repo/logging'
import { isMacOs } from '@repo/utils'

import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import { useSpotlightContext } from 'providers/ui/SpotlightContext'

import GlobalNavigationItem from './GlobalNavigationItem'

export function GlobalNavigationSpotlight() {
    const { isOpen, setIsOpen } = useSpotlightContext()

    const handleClick = () => {
        logEvent(SegmentEvent.GlobalSearchOpenButtonClick)
        setIsOpen(!isOpen)
    }

    return (
        <GlobalNavigationItem
            icon="search"
            isActive={false}
            onClick={handleClick}
            label="Global search"
            data-candu-id="global-navigation-menu-spotlight"
            tooltip={
                <>
                    <span>Global search</span>
                    <ShortcutIcon type="dark">
                        {isMacOs ? '⌘' : 'ctrl'}
                    </ShortcutIcon>
                    <ShortcutIcon type="dark">k</ShortcutIcon>
                </>
            }
        />
    )
}
