import React, {useContext, useEffect, useState} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import {SpotlightContext} from 'providers/ui/SpotlightContext'
import {isMacOs} from 'utils/platform'

import GlobalNavigationItem, {
    type GlobalNavigationItemTooltipTrigger,
} from './GlobalNavigationItem'

const defaultTooltipTriggers: GlobalNavigationItemTooltipTrigger = [
    'focus',
    'hover',
]

export function GlobalNavigationSpotlight() {
    const {isOpen, setIsOpen} = useContext(SpotlightContext)
    const [tooltipTriggers, setTooltipTriggers] = useState(
        defaultTooltipTriggers
    )

    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (isOpen) {
            setTooltipTriggers(['hover'])
        } else {
            timeout = setTimeout(() => {
                setTooltipTriggers(defaultTooltipTriggers)
            }, 500)
        }
        return () => clearTimeout(timeout)
    }, [isOpen])

    const handleClick = () => {
        logEvent(SegmentEvent.GlobalSearchOpenButtonClick)
        setIsOpen(!isOpen)
    }

    return (
        <GlobalNavigationItem
            icon="search"
            isActive={false}
            onClick={handleClick}
            tooltipTrigger={tooltipTriggers}
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
