import { useCallback } from 'react'

import { useConditionalShortcuts } from '@repo/utils'
import { useBeforeUnload } from '@gorgias/toolkit-react'

import { useVoiceDevice } from 'hooks/integrations/phone/useVoiceDevice'
import { MonitoringPhoneCall } from 'pages/common/components/PhoneIntegrationBar/MonitoringPhoneCall/MonitoringPhoneCall'

import { IncomingPhoneCall } from './IncomingPhoneCall/IncomingPhoneCall'
import { DefaultExportOngoingPhoneCall as OngoingPhoneCall } from './OngoingPhoneCall/OngoingPhoneCall'
import { OutgoingPhoneCall } from './OutgoingPhoneCall/OutgoingPhoneCall'

export function PhoneIntegrationCallBar(): JSX.Element | null {
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
        // key ensures a fresh component instance per call, so local state
        // (e.g. isConnecting) never leaks from one call to the next
        return (
            <IncomingPhoneCall
                key={call.customParameters.get('call_sid')}
                call={call}
            />
        )
    }

    if (isDialing) {
        return <OutgoingPhoneCall call={call} />
    }

    return <OngoingPhoneCall call={call} />
}
