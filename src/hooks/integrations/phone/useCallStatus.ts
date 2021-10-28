import {useState} from 'react'
import {Call} from '@twilio/voice-sdk'
import {useInterval} from 'react-use'

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
