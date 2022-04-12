import React from 'react'
import {renderHook} from 'react-hooks-testing-library'
import {waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore, {MockStore} from 'redux-mock-store'
import {Device, PreflightTest} from '@twilio/voice-sdk'

import {RootState, StoreDispatch} from 'state/types'
import {initialState} from 'state/twilio/reducers'
import {PreflightCheckStatus} from 'state/twilio/types'
import {setPreflightCheckStatus} from 'state/twilio/actions'

import * as apiCalls from 'models/phoneNumber/resources'

import {usePreflightCheck} from '../usePreflightCheck'
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const withProvider =
    (store: MockStore) =>
    ({children}: {children?: React.ReactNode}) =>
        <Provider store={store}>{children}</Provider>

jest.mock('@twilio/voice-sdk')

describe('usePreflightCheck', () => {
    beforeEach(() => {
        window.location.protocol = 'https:'
        jest.resetAllMocks()
        jest.spyOn(apiCalls, 'fetchToken').mockReturnValue(
            new Promise((resolve) => resolve('fake'))
        )
    })

    it('should perform a preflight check', async () => {
        const store = mockStore({
            twilio: initialState,
        } as RootState)
        renderHook(() => usePreflightCheck(), {
            wrapper: withProvider(store),
        })
        await waitFor(() => {
            expect(store.getActions()).toMatchObject([
                setPreflightCheckStatus(PreflightCheckStatus.Running),
                setPreflightCheckStatus(PreflightCheckStatus.Failed),
            ])
        })
    })

    it('should handle a successful preflight check', async () => {
        jest.spyOn(Device, 'runPreflight').mockImplementation(
            () =>
                ({
                    on: (event: string, callback: () => void) => {
                        if (event === 'completed') {
                            callback()
                        }
                    },
                } as PreflightTest)
        )
        const store = mockStore({
            twilio: initialState,
        } as RootState)
        renderHook(() => usePreflightCheck(), {
            wrapper: withProvider(store),
        })
        await waitFor(() => {
            expect(store.getActions()).toMatchObject([
                setPreflightCheckStatus(PreflightCheckStatus.Running),
                setPreflightCheckStatus(PreflightCheckStatus.Succeeded),
            ])
        })
    })

    it('should handle a failed preflight check', async () => {
        jest.spyOn(Device, 'runPreflight').mockImplementation(
            () =>
                ({
                    on: (event: string, callback: () => void) => {
                        if (event === 'failed') {
                            callback()
                        }
                    },
                } as PreflightTest)
        )
        const store = mockStore({
            twilio: initialState,
        } as RootState)
        renderHook(() => usePreflightCheck(), {
            wrapper: withProvider(store),
        })
        await waitFor(() => {
            expect(store.getActions()).toMatchObject([
                setPreflightCheckStatus(PreflightCheckStatus.Running),
                setPreflightCheckStatus(PreflightCheckStatus.Failed),
            ])
        })
    })
})
