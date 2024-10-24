import {renderHook} from '@testing-library/react-hooks'
import {omit} from 'lodash'
import {useContext} from 'react'

import slice from 'pages/integrations/integration/components/voice/voiceDeviceSlice'
import {initialState} from 'state/twilio/voiceDevice'

import {Context} from '../VoiceDeviceContext'

describe('VoiceDeviceContext', () => {
    it('should provide the correct initial state', () => {
        const {result} = renderHook(() => useContext(Context))
        expect(omit(result.current, 'actions')).toEqual(initialState)
    })

    it('should provide the correct actions', () => {
        const {result} = renderHook(() => useContext(Context))
        slice
        expect(result.current.actions).toEqual({
            setDevice: expect.any(Function),
            setCall: expect.any(Function),
            setIsRinging: expect.any(Function),
            setIsDialing: expect.any(Function),
            setIsConnecting: expect.any(Function),
            setError: expect.any(Function),
            setWarning: expect.any(Function),
            incrementReconnectAttempts: expect.any(Function),
            resetReconnectAttempts: expect.any(Function),
        })
    })
})
