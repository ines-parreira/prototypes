import React, { useEffect } from 'react'

import * as utils from '@repo/utils'
import classNames from 'classnames'

import {
    LegacyButton as Button,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import navbarCss from 'assets/css/navbar.less'
import {
    DEFAULT_ERROR_MESSAGE,
    MICROPHONE_PERMISSION_ERROR_MESSAGE,
} from 'business/twilio'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useHasPhone from 'hooks/useHasPhone'
import PhoneDevice from 'pages/integrations/integration/components/phone/PhoneDevice'
import useMicrophonePermissions from 'pages/integrations/integration/components/voice/useMicrophonePermissions'
import { isDesktopDevice, isDeviceReady } from 'utils/device'

import ButtonIconLabel from './button/ButtonIconLabel'
import DeactivatedViewIcon from './DeactivatedViewIcon'
import ShortcutIcon from './ShortcutIcon/ShortcutIcon'

import css from './PlaceCallNavbarButton.less'

const BUTTON_ID = 'open-dialer-button'

export default function PlaceCallNavbarButton() {
    const [isDeviceVisible, setIsDeviceVisible] = React.useState(false)
    const { device } = useVoiceDevice()
    const hasPhone = useHasPhone()

    const buttonRef = React.useRef<HTMLButtonElement>(null)

    const shouldDisplayButton = hasPhone && isDesktopDevice()
    const isDeviceActive = isDeviceReady(device)

    const { permissionDenied } = useMicrophonePermissions()

    utils.useConditionalShortcuts(
        shouldDisplayButton && isDeviceActive && !permissionDenied,
        'Dialpad',
        {
            OPEN_DIALPAD: {
                action: (e) => {
                    e.preventDefault()
                    setIsDeviceVisible(true)
                },
            },
        },
    )

    useEffect(() => {
        if (!device) {
            setIsDeviceVisible(false)
        }
    }, [device])

    const isButtonDisabled = !isDeviceActive || permissionDenied

    if (!shouldDisplayButton) {
        return null
    }

    return (
        <>
            <Button
                className={classNames(navbarCss.navbarButton, 'flex-grow')}
                fillStyle="ghost"
                isDisabled={isButtonDisabled}
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
                    {isButtonDisabled && (
                        <DeactivatedViewIcon
                            id="place-call-button"
                            tooltipText={
                                !isDeviceActive
                                    ? DEFAULT_ERROR_MESSAGE
                                    : MICROPHONE_PERMISSION_ERROR_MESSAGE
                            }
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
                        {utils.isMacOs ? '⌘' : 'ctrl'}
                    </ShortcutIcon>
                    <ShortcutIcon type="dark">e</ShortcutIcon>
                </div>
            </Tooltip>
        </>
    )
}
