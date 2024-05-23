import {createContext} from 'react'
import {noop} from 'lodash'
import {State, initialState} from 'state/twilio/voiceDevice'
import {VoiceDeviceActions} from './types'

export type VoiceDeviceContextState = State & {actions: VoiceDeviceActions}

export const Context = createContext<VoiceDeviceContextState>({
    ...initialState,
    actions: {
        setDevice: noop,
        setCall: noop,
        setIsRinging: noop,
        setIsDialing: noop,
        setIsConnecting: noop,
        setError: noop,
        setWarning: noop,
        incrementReconnectAttempts: noop,
        resetReconnectAttempts: noop,
    },
})
