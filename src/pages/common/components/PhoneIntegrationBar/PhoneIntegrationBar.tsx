import React, {useCallback} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {useDevice} from 'hooks/integrations/phone/useDevice'
import useBeforeUnload from 'hooks/useBeforeUnload'

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

    if (isRinging) {
        return <IncomingPhoneCall call={call} />
    }

    if (isDialing) {
        return <OutgoingPhoneCall call={call} />
    }

    return <OngoingPhoneCall call={call} />
}
