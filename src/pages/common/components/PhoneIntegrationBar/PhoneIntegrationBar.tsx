import React, {useCallback} from 'react'
import {useBeforeUnload} from 'react-use'
import useAppSelector from 'hooks/useAppSelector'
import {useDevice} from 'hooks/integrations/phone/useDevice'

import OngoingPhoneCall from './OngoingPhoneCall/OngoingPhoneCall'
import IncomingPhoneCall from './IncomingPhoneCall/IncomingPhoneCall'
import OutgoingPhoneCall from './OutgoingPhoneCall/OutgoingPhoneCall'

export default function PhoneIntegrationBar(): JSX.Element | null {
    useDevice()
    const {call, isDialing, isRinging} = useAppSelector((state) => state.twilio)

    const isInProgress = useCallback(
        () => !!call || isDialing || isRinging,
        [call, isDialing, isRinging]
    )

    useBeforeUnload(isInProgress)

    if (!call) {
        return null
    }

    if (isDialing) {
        return <OutgoingPhoneCall call={call} />
    }

    if (isRinging) {
        return <IncomingPhoneCall call={call} />
    }

    return <OngoingPhoneCall call={call} />
}
