import {useEffect} from 'react'
import {Device} from '@twilio/voice-sdk'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {useErrorHandling} from 'hooks/integrations/phone/useErrorHandling'

import {
    connectDevice,
    destroyDevice,
    disconnectDevice,
    isRecoverableError,
} from 'hooks/integrations/phone/utils'
import {setDevice} from 'state/twilio/actions'

export function useDevice(useNewErrorHandling: boolean | undefined) {
    useErrorHandling()
    const dispatch = useAppDispatch()
    const {device, isConnecting, reconnectAttempts, error} = useAppSelector(
        (state) => state.twilio
    )

    useEffect(() => {
        if (useNewErrorHandling !== true) {
            return
        }

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
                destroyDevice(device)
                break

            case Device.State.Destroyed:
                dispatch(setDevice(null))
                break

            default:
                break
        }

        return () => {
            if (device) {
                void disconnectDevice(device)
                dispatch(setDevice(null))
            }
        }
    }, [
        device,
        dispatch,
        error,
        isConnecting,
        reconnectAttempts,
        useNewErrorHandling,
    ])
}
