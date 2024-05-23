import {renderHook} from '@testing-library/react-hooks'
import React from 'react'
import {Provider} from 'react-redux'
import VoiceDeviceProvider from 'pages/integrations/integration/components/voice/VoiceDeviceProvider'
import {initialState} from 'state/twilio/voiceDevice'
import {mockStore} from 'utils/testing'
import useVoiceDevice from '../useVoiceDevice'

describe('useVoiceDevice', () => {
    it('should return the context value from VoiceDeviceProvider', () => {
        const wrapper = ({children}: {children: React.ReactNode}) => (
            <Provider store={mockStore({} as any)}>
                <VoiceDeviceProvider>{children}</VoiceDeviceProvider>
            </Provider>
        )

        const {result} = renderHook(() => useVoiceDevice(), {wrapper})

        expect(result.current).toMatchObject(initialState)
    })
})
