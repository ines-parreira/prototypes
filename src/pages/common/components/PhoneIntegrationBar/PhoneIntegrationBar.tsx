import classNames from 'classnames'
import React, {useCallback} from 'react'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useBeforeUnload from 'hooks/useBeforeUnload'
import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import {useTheme} from 'theme'

import IncomingPhoneCall from './IncomingPhoneCall/IncomingPhoneCall'
import OngoingPhoneCall from './OngoingPhoneCall/OngoingPhoneCall'
import OutgoingPhoneCall from './OutgoingPhoneCall/OutgoingPhoneCall'

import css from './PhoneIntegrationBar.less'

export default function PhoneIntegrationBar(): JSX.Element | null {
    const theme = useTheme()

    const {call, isDialing, isRinging} = useVoiceDevice()

    const isInProgress = useCallback(
        () => !!call || isDialing || isRinging,
        [call, isDialing, isRinging]
    )

    useBeforeUnload(isInProgress)

    useConditionalShortcuts(!!call, 'PhoneCall', {
        ACCEPT_CALL: {
            action: (e) => {
                e.preventDefault()
                if (isRinging) {
                    call?.accept()
                }
            },
        },
    })

    if (!call) {
        return null
    }

    if (isRinging) {
        return (
            <IncomingPhoneCall
                className={classNames(css[theme.resolvedName], css.bar)}
                call={call}
            />
        )
    }

    if (isDialing) {
        return (
            <OutgoingPhoneCall
                className={classNames(css[theme.resolvedName], css.bar)}
                call={call}
            />
        )
    }

    return <OngoingPhoneCall call={call} />
}
