import React, { useEffect } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import * as utils from '@repo/utils'
import { isDeviceReady } from '@repo/voice'

import {
    LegacyShortcutKey as ShortcutKey,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import navbarCss from 'assets/css/navbar.less'
import {
    DEFAULT_ERROR_MESSAGE,
    MICROPHONE_PERMISSION_ERROR_MESSAGE,
} from 'business/twilio'
import { Navigation } from 'components/Navigation/Navigation'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useHasPhone from 'hooks/useHasPhone'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import DeactivatedViewIcon from 'pages/common/components/DeactivatedViewIcon'
import PhoneDevice from 'pages/integrations/integration/components/phone/PhoneDevice'
import useMicrophonePermissions from 'pages/integrations/integration/components/voice/useMicrophonePermissions'

import css from './PlaceCallNavbarButton.less'

const BUTTON_ID = 'open-dialer-button'

export function PlaceCallNavbarButton() {
    const [isDeviceVisible, setIsDeviceVisible] = React.useState(false)
    const { device } = useVoiceDevice()
    const hasPhone = useHasPhone()

    const buttonRef = React.useRef<HTMLButtonElement>(null)

    const shouldDisplayButton = hasPhone && utils.isDesktopDevice()
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
        <div className={css.placeCallNavbarButtonWrapper}>
            <Navigation.SectionItem
                as="button"
                className={css.navbarButton}
                disabled={isButtonDisabled}
                onClick={() => {
                    logEvent(SegmentEvent.PlaceCallButtonClicked)
                    setIsDeviceVisible(!isDeviceVisible)
                }}
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
            </Navigation.SectionItem>
            <Tooltip
                target={BUTTON_ID}
                boundariesElement="viewport"
                offset="0, 8"
                placement="right"
            >
                <div className={navbarCss.tooltipContent}>
                    <span>Open the dialpad</span>
                    <ShortcutKey color="dark">
                        {utils.isMacOs ? '⌘' : 'ctrl'}
                    </ShortcutKey>
                    <ShortcutKey color="dark">e</ShortcutKey>
                </div>
            </Tooltip>
        </div>
    )
}
