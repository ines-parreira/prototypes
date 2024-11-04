import {Tooltip} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React, {useEffect} from 'react'

import navbarCss from 'assets/css/navbar.less'
import {DEFAULT_ERROR_MESSAGE} from 'business/twilio'
import useHasPhone from 'core/app/hooks/useHasPhone'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import PhoneDevice from 'pages/integrations/integration/components/phone/PhoneDevice'
import {isDesktopDevice, isDeviceReady} from 'utils/device'
import {isMacOs} from 'utils/platform'

import Button from './button/Button'
import ButtonIconLabel from './button/ButtonIconLabel'
import DeactivatedViewIcon from './DeactivatedViewIcon'
import css from './PlaceCallNavbarButton.less'
import ShortcutIcon from './ShortcutIcon/ShortcutIcon'

const BUTTON_ID = 'open-dialer-button'

export default function PlaceCallNavbarButton() {
    const [isDeviceVisible, setIsDeviceVisible] = React.useState(false)
    const {device} = useVoiceDevice()
    const hasPhone = useHasPhone()

    const buttonRef = React.useRef<HTMLButtonElement>(null)

    const shouldDisplayButton = hasPhone && isDesktopDevice()
    const isDeviceActive = isDeviceReady(device)

    useConditionalShortcuts(shouldDisplayButton && isDeviceActive, 'Dialpad', {
        OPEN_DIALPAD: {
            action: (e) => {
                e.preventDefault()
                setIsDeviceVisible(true)
            },
        },
    })

    useEffect(() => {
        if (!device) {
            setIsDeviceVisible(false)
        }
    }, [device])

    if (!shouldDisplayButton) {
        return null
    }

    return (
        <>
            <Button
                className={classNames(navbarCss.navbarButton, 'flex-grow')}
                fillStyle="ghost"
                isDisabled={!isDeviceActive}
                onClick={() => setIsDeviceVisible(!isDeviceVisible)}
                ref={buttonRef}
                id={BUTTON_ID}
            >
                <ButtonIconLabel
                    icon="phone"
                    className={navbarCss.buttonIcon}
                />
                <div className={css.navbarButtonContent}>
                    Place call
                    {!isDeviceActive && (
                        <DeactivatedViewIcon
                            id="place-call-button"
                            tooltipText={DEFAULT_ERROR_MESSAGE}
                        />
                    )}
                </div>
                <PhoneDevice
                    isOpen={isDeviceVisible}
                    setIsOpen={setIsDeviceVisible}
                    target={buttonRef}
                />
            </Button>
            <Tooltip
                target={BUTTON_ID}
                boundariesElement="viewport"
                offset="0, 8"
                placement="right"
            >
                <div className={navbarCss.tooltipContent}>
                    <span>Open the dialpad</span>
                    <ShortcutIcon type="dark">
                        {isMacOs ? '⌘' : 'ctrl'}
                    </ShortcutIcon>
                    <ShortcutIcon type="dark">e</ShortcutIcon>
                </div>
            </Tooltip>
        </>
    )
}
