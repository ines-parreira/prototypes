import React from 'react'

import { assumeMock } from '@repo/testing'
import { isDeviceReady } from '@repo/voice'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { resetLDMocks } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import VoiceDeviceProvider from 'pages/integrations/integration/components/voice/VoiceDeviceProvider'
import type { RootState, StoreDispatch } from 'state/types'

import PhoneTicketSubmitButtons from '../PhoneTicketSubmitButtons'

jest.mock('@repo/voice', () => ({
    isDeviceReady: jest.fn(),
}))

const isDeviceReadyMock = assumeMock(isDeviceReady)

const getWrapper =
    (store: any) =>
    ({ children }: any) => (
        <Provider store={store}>
            <VoiceDeviceProvider>{children}</VoiceDeviceProvider>
        </Provider>
    )

describe('<PhoneTicketSubmitButtons/>', () => {
    let store: MockStoreEnhanced
    const integrationId = 1
    const validFromAddress = '+14158880101'
    const validToAddress = '+33611223344'
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    function getSource(
        fromId: number | null = integrationId,
        fromAddress: string | null = validFromAddress,
        toAddress: string | null = validToAddress,
    ) {
        return {
            from: {
                id: fromId,
                address: fromAddress,
            },
            to: [
                {
                    address: toAddress,
                    name: 'Bob',
                },
            ],
        }
    }

    function getState(source: any = getSource()) {
        return {
            newMessage: fromJS({
                newMessage: {
                    source,
                },
            }),
        }
    }

    beforeEach(() => {
        isDeviceReadyMock.mockReturnValue(true)
        jest.resetAllMocks()
        resetLDMocks()
    })

    it('should render', () => {
        const state = getState()
        store = mockStore(state)

        const { getByText } = render(<PhoneTicketSubmitButtons />, {
            wrapper: getWrapper(store),
        })

        expect(getByText('Call')).toBeVisible()
    })

    const invalidStates = [
        getState(getSource(null)), // Missing integration ID
        getState(getSource(integrationId, null)), // Missing from address
        getState(getSource(integrationId, validFromAddress, null)), // Missing to address
    ]

    it.each(invalidStates)(
        'should render as disabled because the state is invalid',
        (invalidState) => {
            store = mockStore(invalidState)

            const { getByRole } = render(<PhoneTicketSubmitButtons />, {
                wrapper: getWrapper(store),
            })

            expect(getByRole('button', { name: 'Call' })).toBeAriaDisabled()
        },
    )

    it('should render as disabled because the device is not ready', () => {
        store = mockStore(getState())

        isDeviceReadyMock.mockReturnValue(false)

        const { getByRole } = render(<PhoneTicketSubmitButtons />, {
            wrapper: getWrapper(store),
        })

        expect(getByRole('button', { name: 'Call' })).toBeAriaDisabled()
    })
})
