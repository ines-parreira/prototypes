import { useState } from 'react'

import type { Call } from '@twilio/voice-sdk'
import { useInterval } from '@gorgias/toolkit-react'

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
