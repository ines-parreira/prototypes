import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Provider} from 'react-redux'
import {RedirectProps} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {useGetOnboardingStatusMap} from 'pages/convert/channelConnections/hooks/useGetOnboardingStatusMap'
import {useIsOverviewPageEnabled} from 'pages/convert/common/hooks/useIsOverviewPageEnabled'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

import ConvertRoute from '../ConvertRoute'

jest.mock('pages/convert/common/hooks/useIsOverviewPageEnabled')
const useIsOverviewPageEnabledSpy = assumeMock(useIsOverviewPageEnabled)

jest.mock('pages/convert/channelConnections/hooks/useGetOnboardingStatusMap')
const useGetOnboardingStatusMapMock = assumeMock(useGetOnboardingStatusMap)

jest.mock('react-router-dom', () => {
    return {
        Redirect: jest.fn(
            ({to}: RedirectProps) => `Redirected to ${to.toString()}`
        ),
    }
})

jest.mock('launchdarkly-react-client-sdk', () => ({
    useFlags: jest.fn(),
}))

const useFlagsMock = assumeMock(useFlags)

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
        useGetOnboardingStatusMapMock.mockReturnValue({
            onboardingMap: {},
            isLoading: false,
            isError: false,
        })

        useFlagsMock.mockReturnValue({
            'any-flag': true,
        })
    })

    describe.each<{
        isFlagActive: boolean
    }>([{isFlagActive: true}, {isFlagActive: false}])(
        'when convert-overview-page flag is $isFlagActive',
        ({isFlagActive}) => {
            beforeEach(() => {
                useIsOverviewPageEnabledSpy.mockReturnValue(isFlagActive)
            })

            describe('when there are no sorted integrations', () => {
                const expectedUrl = isFlagActive
                    ? '/app/convert/overview'
                    : '/app/convert/setup'

                const state: Partial<RootState> = {
                    integrations: fromJS({
                        integrations: [],
                    }),
                }

                it(`redirects to ${expectedUrl}`, () => {
                    const {getByText} = render(
                        <Provider store={mockStore(state)}>
                            <ConvertRoute />
                        </Provider>
                    )

                    expect(
                        getByText(`Redirected to ${expectedUrl}`)
                    ).toBeInTheDocument()
                })
            })

            describe('when there are sorted integrations', () => {
                let expectedUrl = isFlagActive
                    ? '/app/convert/overview'
                    : '/app/convert/2/campaigns'

                const state: Partial<RootState> = {
                    integrations: fromJS({integrations}),
                }

                it(`redirects to ${expectedUrl}`, () => {
                    useGetOnboardingStatusMapMock.mockReturnValue({
                        onboardingMap: {'2': true},
                        isLoading: false,
                        isError: false,
                    })

                    const {getByText} = render(
                        <Provider store={mockStore(state)}>
                            <ConvertRoute />
                        </Provider>
                    )

                    expect(
                        getByText(`Redirected to ${expectedUrl}`)
                    ).toBeInTheDocument()
                })

                it('redirects to setup page of the alphabetically first integration if there is no onboarding status', () => {
                    expectedUrl = isFlagActive
                        ? '/app/convert/overview'
                        : '/app/convert/2/setup'

                    const {getByText} = render(
                        <Provider store={mockStore(state)}>
                            <ConvertRoute />
                        </Provider>
                    )

                    expect(
                        getByText(`Redirected to ${expectedUrl}`)
                    ).toBeInTheDocument()
                })
            })
        }
    )
})
