import React, { useEffect, useMemo, useReducer } from 'react'

import { bindActionCreators, Dispatch } from '@reduxjs/toolkit'
import { Device } from '@twilio/voice-sdk'

import { useErrorHandling } from 'hooks/integrations/phone/useErrorHandling'
import {
    connectDevice,
    disconnectDevice,
    isRecoverableError,
} from 'hooks/integrations/phone/utils'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useHasPhone from 'hooks/useHasPhone'
import slice from 'pages/integrations/integration/components/voice/voiceDeviceSlice'
import { isActive } from 'state/currentUser/selectors'
import { initialState } from 'state/twilio/voiceDevice'
import { isDesktopDevice } from 'utils/device'

import { Context } from './VoiceDeviceContext'

const { actions: contextActions, reducer } = slice

export default function VoiceDeviceProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [state, dispatch] = useReducer(reducer, initialState)
    const isAgentActive = useAppSelector(isActive)
    const isDesktop = isDesktopDevice()
    const hasPhone = useHasPhone()

    const appDispatch = useAppDispatch()

    const actions = useMemo(
        () => bindActionCreators(contextActions, dispatch as Dispatch),
        [dispatch],
    )

    useErrorHandling(state, actions)

    useEffect(() => {
        if (state.error && !isRecoverableError(state.error)) {
            return
        }

        if (!isDesktop || !hasPhone) {
            return
        }

        if (state.isConnecting) {
            return
        }

        if (!state.device) {
            void connectDevice(appDispatch, state.reconnectAttempts, actions)
            return
        }

        switch (state.device.state) {
            case Device.State.Registered:
            case Device.State.Registering:
            case Device.State.Unregistered:
                break

            case Device.State.Destroyed:
                void disconnectDevice(state.device, actions)
                break

            default:
                break
        }
    }, [state, appDispatch, isDesktop, isAgentActive, actions, hasPhone])

    const value = useMemo(() => ({ ...state, actions }), [state, actions])

    return <Context.Provider value={value}>{children}</Context.Provider>
}
