import React, { useContext } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import { SpotlightContext } from 'providers/ui/SpotlightContext'
import { isMacOs } from 'utils/platform'

import GlobalNavigationItem from './GlobalNavigationItem'

export function GlobalNavigationSpotlight() {
    const { isOpen, setIsOpen } = useContext(SpotlightContext)

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
