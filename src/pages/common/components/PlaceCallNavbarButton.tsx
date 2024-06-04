import React from 'react'
import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import navbarCss from 'assets/css/navbar.less'
import {isDesktopDevice} from 'utils/device'
import {DEFAULT_ERROR_MESSAGE} from 'business/twilio'
import {FeatureFlagKey} from 'config/featureFlags'
import PhoneDevice from 'pages/integrations/integration/components/phone/PhoneDevice'
import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useHasPhone from 'core/app/hooks/useHasPhone'

import Button from './button/Button'
import ButtonIconLabel from './button/ButtonIconLabel'
import DeactivatedViewIcon from './DeactivatedViewIcon'
import css from './PlaceCallNavbarButton.less'

export default function PlaceCallNavbarButton() {
    const [isDeviceVisible, setIsDeviceVisible] = React.useState(false)
    const isOutboundDialerEnabled = useFlags()[FeatureFlagKey.OutboundDialer]
    const {device} = useVoiceDevice()
    const hasPhone = useHasPhone()

    const buttonRef = React.useRef<HTMLButtonElement>(null)

    if (!isOutboundDialerEnabled || !isDesktopDevice() || !hasPhone) {
        return null
    }

    return (
        <Button
            className={classNames(navbarCss.navbarButton, 'flex-grow')}
            fillStyle="ghost"
            isDisabled={false}
            onClick={() => setIsDeviceVisible(!isDeviceVisible)}
            ref={buttonRef}
        >
            <ButtonIconLabel
                icon="phone"
                iconClassName={navbarCss.buttonIcon}
            />
            <div className={css.navbarButtonContent}>
                Place call
                {!device && (
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
    )
}
