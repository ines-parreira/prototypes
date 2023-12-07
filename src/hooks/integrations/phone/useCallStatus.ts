import {useState} from 'react'
import {Call} from '@twilio/voice-sdk'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
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
