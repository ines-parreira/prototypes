import React, { useContext } from 'react'

import { useId } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { isMacOs } from '@repo/utils'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import navbarCss from 'assets/css/navbar.less'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import { SpotlightContext } from 'providers/ui/SpotlightContext'

const SpotlightButton = () => {
    const { isOpen, setIsOpen } = useContext(SpotlightContext)
    const id = useId()
    const buttonId = 'spotlight-button-' + id

    const handleClick = () => {
        logEvent(SegmentEvent.GlobalSearchOpenButtonClick)
        setIsOpen(!isOpen)
    }

    return (
        <>
            <Button
                id={buttonId}
                className={navbarCss.navbarButton}
                fillStyle="ghost"
                onClick={handleClick}
            >
                <ButtonIconLabel
                    icon="search"
                    className={navbarCss.buttonIcon}
                />
                Search
            </Button>
            <Tooltip
                target={buttonId}
                boundariesElement="viewport"
                offset="0, 8"
                placement="right"
            >
                <div className={navbarCss.tooltipContent}>
                    <span>Global search</span>
                    <ShortcutIcon type="dark">
                        {isMacOs ? '⌘' : 'ctrl'}
                    </ShortcutIcon>
                    <ShortcutIcon type="dark">k</ShortcutIcon>
                </div>
            </Tooltip>
        </>
    )
}

export default SpotlightButton
