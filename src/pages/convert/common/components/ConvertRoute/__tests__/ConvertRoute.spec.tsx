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
import ConvertRoute from '../ConvertRoute'

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
})
