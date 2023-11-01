import React, {useContext} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import useId from 'hooks/useId'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ShortcutIcon from 'pages/common/components/ShortcutIcon/ShortcutIcon'
import Tooltip from 'pages/common/components/Tooltip'
import {SpotlightContext} from 'providers/ui/SpotlightContext'
import {isMacOs} from 'utils/platform'

import css from './SpotlightButton.less'

const SpotlightButton = () => {
    const {isOpen, setIsOpen} = useContext(SpotlightContext)
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
                className={css.button}
                fillStyle="ghost"
                onClick={handleClick}
            >
                <ButtonIconLabel icon="search" iconClassName={css.icon} />
                Search
            </Button>
            <Tooltip
                target={buttonId}
                boundariesElement="viewport"
                offset="0, 8"
                placement="right"
                className={css.tooltip}
            >
                <div className={css.tooltipContent}>
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
