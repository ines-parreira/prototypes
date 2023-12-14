import {useState} from 'react'
import {Call} from '@twilio/voice-sdk'
import useInterval from 'hooks/useInterval'

export function useCallStatus(call: Call): Call.State {
    const [status, setStatus] = useState(call.status())

    useInterval(
        () => {
            setStatus(call.status())
        },
        call ? 1000 : null
    )

    return status
}
