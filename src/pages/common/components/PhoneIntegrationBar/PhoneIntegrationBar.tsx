import React, {useCallback} from 'react'
import classNames from 'classnames'

import useBeforeUnload from 'hooks/useBeforeUnload'
import {useTheme} from 'theme'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import OngoingPhoneCall from './OngoingPhoneCall/OngoingPhoneCall'
import IncomingPhoneCall from './IncomingPhoneCall/IncomingPhoneCall'
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

    if (!call) {
        return null
    }

    if (isRinging) {
        return (
            <IncomingPhoneCall
                className={classNames(css[theme], css.bar)}
                call={call}
            />
        )
    }

    if (isDialing) {
        return (
            <OutgoingPhoneCall
                className={classNames(css[theme], css.bar)}
                call={call}
            />
        )
    }

    return <OngoingPhoneCall call={call} />
}
