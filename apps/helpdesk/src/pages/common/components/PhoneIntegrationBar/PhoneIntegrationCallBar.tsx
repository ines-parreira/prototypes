import { useCallback } from 'react'

import { useBeforeUnload } from '@repo/hooks'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import MonitoringPhoneCall from 'pages/common/components/PhoneIntegrationBar/MonitoringPhoneCall/MonitoringPhoneCall'

import IncomingPhoneCall from './IncomingPhoneCall/IncomingPhoneCall'
import OngoingPhoneCall from './OngoingPhoneCall/OngoingPhoneCall'
import OutgoingPhoneCall from './OutgoingPhoneCall/OutgoingPhoneCall'

export default function PhoneIntegrationCallBar(): JSX.Element | null {
    const { call, isDialing, isRinging } = useVoiceDevice()

    const isInProgress = useCallback(
        () => !!call || isDialing || isRinging,
        [call, isDialing, isRinging],
    )

    useBeforeUnload(isInProgress)

    const isMonitoring = call?.customParameters.get('is_monitoring') === 'true'

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

    if (isMonitoring) {
        return <MonitoringPhoneCall call={call} />
    }

    if (isRinging) {
        return <IncomingPhoneCall call={call} />
    }

    if (isDialing) {
        return <OutgoingPhoneCall call={call} />
    }

    return <OngoingPhoneCall call={call} />
}
