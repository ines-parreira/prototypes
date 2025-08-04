import { useState } from 'react'

import { useInterval } from '@repo/hooks'
import { Call } from '@twilio/voice-sdk'

export function useCallStatus(call: Call): Call.State {
    const [status, setStatus] = useState(call.status())

    useInterval(
        () => {
            setStatus(call.status())
        },
        call ? 1000 : null,
    )

    return status
}
