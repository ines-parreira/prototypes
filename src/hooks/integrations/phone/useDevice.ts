import {useEffect} from 'react'
import {Device} from '@twilio/voice-sdk'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {useErrorHandling} from 'hooks/integrations/phone/useErrorHandling'

import {
    connectDevice,
    disconnectDevice,
    isRecoverableError,
} from 'hooks/integrations/phone/utils'
import {isActive} from 'state/currentUser/selectors'

export function useDevice() {
    useErrorHandling()
    const dispatch = useAppDispatch()
    const {device, isConnecting, reconnectAttempts, error} = useAppSelector(
        (state) => state.twilio
    )
    const isAgentActive = useAppSelector(isActive)

    useEffect(() => {
        if (error && !isRecoverableError(error)) {
            return
        }

        if (isConnecting) {
            return
        }

        if (!device) {
            void connectDevice(dispatch, reconnectAttempts)
            return
        }

        switch (device.state) {
            case Device.State.Registered:
            case Device.State.Registering:
                break

            case Device.State.Unregistered:
            case Device.State.Destroyed:
                void disconnectDevice(dispatch, device)
                break

            default:
                break
        }
    }, [
        device,
        error,
        dispatch,
        isConnecting,
        isAgentActive,
        reconnectAttempts,
    ])
}
