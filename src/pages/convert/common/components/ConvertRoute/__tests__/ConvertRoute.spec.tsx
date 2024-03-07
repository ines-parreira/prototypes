import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {RedirectProps} from 'react-router-dom'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'
import {useGetOnboardingStatusMap} from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import {useIsConvertOnboardingUiEnabled} from 'pages/convert/common/hooks/useIsConvertOnboardingUiEnabled'
import ConvertRoute from '../ConvertRoute'

jest.mock('pages/convert/common/hooks/useIsConvertOnboardingUiEnabled')
const isConvertOnboardingUiEnabledMock =
    useIsConvertOnboardingUiEnabled as jest.Mock

jest.mock('pages/convert/channelConnections/hooks/useGetOnboardingStatusMap')
const useGetOnboardingStatusMapMock = assumeMock(useGetOnboardingStatusMap)

jest.mock('react-router-dom', () => {
    return {
        Redirect: jest.fn(
            ({to}: RedirectProps) => `Redirected to ${to.toString()}`
        ),
    }
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('ConvertRoute', () => {
    const integrations = [
        {
            id: 1,
            type: 'gorgias_chat',
            name: 'Best chat',
            meta: {app_id: '1'},
        },
        {
            id: 2,
            type: 'gorgias_chat',
            name: 'A bit worse chat',
            meta: {app_id: '2'},
        },
    ]

    afterAll(() => {
        jest.resetAllMocks()
    })

    beforeEach(() => {
        isConvertOnboardingUiEnabledMock.mockReturnValue(true)
    })

    it('redirects to /app/convert/setup when there are no sorted integrations', () => {
        const state: Partial<RootState> = {
            integrations: fromJS({
                integrations: [],
            }),
        }

        useGetOnboardingStatusMapMock.mockReturnValueOnce({})

        const {getByText} = render(
            <Provider store={mockStore(state)}>
                <ConvertRoute />
            </Provider>
        )

        expect(
            getByText('Redirected to /app/convert/setup')
        ).toBeInTheDocument()
    })

    it('redirects to chat wizard when there are no sorted integrations and no onboarding', () => {
        const state: Partial<RootState> = {
            integrations: fromJS({
                integrations: [],
            }),
        }

        isConvertOnboardingUiEnabledMock.mockReturnValue(false)
        useGetOnboardingStatusMapMock.mockReturnValueOnce({})

        const {getByText} = render(
            <Provider store={mockStore(state)}>
                <ConvertRoute />
            </Provider>
        )

        expect(
            getByText(
                'Redirected to /app/settings/channels/gorgias_chat/new/create-wizard'
            )
        ).toBeInTheDocument()
    })

    it('redirects to installation page of the alphabetically first integration', () => {
        const state: Partial<RootState> = {
            integrations: fromJS({integrations}),
        }

        useGetOnboardingStatusMapMock.mockReturnValueOnce({'2': true})

        const {getByText} = render(
            <Provider store={mockStore(state)}>
                <ConvertRoute />
            </Provider>
        )

        expect(
            getByText('Redirected to /app/convert/2/installation')
        ).toBeInTheDocument()
    })

    it('redirects to setup page of the alphabetically first integration', () => {
        const state: Partial<RootState> = {
            integrations: fromJS({integrations}),
        }

        useGetOnboardingStatusMapMock.mockReturnValueOnce({})

        const {getByText} = render(
            <Provider store={mockStore(state)}>
                <ConvertRoute />
            </Provider>
        )

        expect(
            getByText('Redirected to /app/convert/2/setup')
        ).toBeInTheDocument()
    })

    it('redirects to installation page of first integration', () => {
        const state: Partial<RootState> = {
            integrations: fromJS({integrations}),
        }

        useGetOnboardingStatusMapMock.mockReturnValueOnce({})
        isConvertOnboardingUiEnabledMock.mockReturnValue(false)

        const {getByText} = render(
            <Provider store={mockStore(state)}>
                <ConvertRoute />
            </Provider>
        )

        expect(
            getByText('Redirected to /app/convert/2/installation')
        ).toBeInTheDocument()
    })
})
