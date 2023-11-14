import React from 'react'
import {render} from '@testing-library/react'

import {Provider} from 'react-redux'
import {createStore} from 'redux'
import {fromJS} from 'immutable'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {RootState} from 'state/types'
import {user} from 'fixtures/users'
import {AGENT_ROLE} from 'config/user'
import {assumeMock} from 'utils/testing'
import useGetConvertStatus from 'pages/settings/revenue/hooks/useGetConvertStatus'
import {Components} from 'rest_api/revenue_addon_api/client.generated'
import {ConvertSetupBanner} from '../ConvertSetupBanner'

const defaultState = {
    currentUser: fromJS(user),
} as RootState
const store = createStore((state) => state as RootState, defaultState)

const buttonText = 'Continue Setup'
const messageText = 'You have activated the Convert product'

jest.mock('pages/settings/revenue/hooks/useGetConvertStatus')
const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

const isInstalled: ReturnType<typeof useGetConvertStatus> = {
    status: 'active',
    usage_status: 'ok',
    usage: 0,
    limit: 50,
    bundle_status: 'installed',
} as Components.Schemas.SubscriptionUsageAndBundleStatusSchema

const isNotInstalled: ReturnType<typeof useGetConvertStatus> = {
    status: 'active',
    usage_status: 'ok',
    usage: 0,
    limit: 50,
    bundle_status: 'not_installed',
} as Components.Schemas.SubscriptionUsageAndBundleStatusSchema

describe('ConvertSetupBanner', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render correctly', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        useGetConvertStatusMock.mockReturnValue(isNotInstalled)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertSetupBanner />
            </Provider>
        )

        expect(queryByText(messageText, {exact: false})).toBeInTheDocument()
        expect(queryByText(buttonText)).toBeInTheDocument()
    })

    it('should not render because has bundle installed', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        useGetConvertStatusMock.mockReturnValue(isInstalled)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertSetupBanner />
            </Provider>
        )

        expect(queryByText(messageText, {exact: false})).not.toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })

    it('should render button if is not admin', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        useGetConvertStatusMock.mockReturnValue(isNotInstalled)

        const agentStore = createStore((state) => state as RootState, {
            currentUser: fromJS({
                ...user,
                role: {name: AGENT_ROLE},
            }),
        })

        const {queryByText} = render(
            <Provider store={agentStore}>
                <ConvertSetupBanner />
            </Provider>
        )
        expect(queryByText(messageText, {exact: false})).toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })
})
