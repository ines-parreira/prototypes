import React, {useCallback, useEffect, useState} from 'react'
import {useBeforeUnload, useTimeoutFn} from 'react-use'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {useDevice} from 'hooks/integrations/phone/useDevice'
import {useDevice_DEPRECATED} from 'hooks/integrations/phone/useDevice_DEPRECATED'

import OngoingPhoneCall from './OngoingPhoneCall/OngoingPhoneCall'
import IncomingPhoneCall from './IncomingPhoneCall/IncomingPhoneCall'
import OutgoingPhoneCall from './OutgoingPhoneCall/OutgoingPhoneCall'

export default function PhoneIntegrationBar(): JSX.Element | null {
    const useNewErrorHandlingFlag =
        useFlags()[FeatureFlagKey.NewPhoneErrorHandling]

    const [useNewErrorHandling, setUseNewErrorHandling] = useState(
        useNewErrorHandlingFlag
    )

    useEffect(() => {
        setUseNewErrorHandling(useNewErrorHandlingFlag)
    }, [useNewErrorHandlingFlag])

    useTimeoutFn(() => {
        if (useNewErrorHandling === undefined) {
            setUseNewErrorHandling(false)
        }
    }, 5 * 1000)

    useDevice(useNewErrorHandling)
    useDevice_DEPRECATED(useNewErrorHandling)

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
