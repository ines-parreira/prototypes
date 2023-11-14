import React from 'react'
import {render} from '@testing-library/react'

import {Provider} from 'react-redux'
import {createStore} from 'redux'
import {fromJS} from 'immutable'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import * as isConvertCampaignCappingEnabledHook from 'pages/settings/revenue/hooks/useIsConvertCampaignCappingEnabled'
import {RootState} from 'state/types'
import {user} from 'fixtures/users'
import useGetConvertStatus from 'pages/settings/revenue/hooks/useGetConvertStatus'
import {Components} from 'rest_api/revenue_addon_api/client.generated'
import {assumeMock} from 'utils/testing'
import {ConvertLimitBanner} from '../ConvertLimitBanner'

const defaultState = {
    currentUser: fromJS(user),
} as RootState
const store = createStore((state) => state as RootState, defaultState)

jest.mock('pages/settings/revenue/hooks/useGetConvertStatus')

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

const isLimitReached: ReturnType<typeof useGetConvertStatus> = {
    status: 'active',
    usage_status: 'limit-reached',
    usage: 51,
    limit: 50,
    bundle_status: 'installed',
} as Components.Schemas.SubscriptionUsageAndBundleStatusSchema

const isLimitReachedNoBundle: ReturnType<typeof useGetConvertStatus> = {
    status: 'active',
    usage_status: 'limit-reached',
    usage: 51,
    limit: 50,
    bundle_status: 'not_installed',
} as Components.Schemas.SubscriptionUsageAndBundleStatusSchema

const isLimitOk: ReturnType<typeof useGetConvertStatus> = {
    status: 'active',
    usage_status: 'ok',
    usage: 0,
    limit: 50,
    bundle_status: 'installed',
} as Components.Schemas.SubscriptionUsageAndBundleStatusSchema

const buttonText = 'Upgrade'
const messageText = "You've reached the limit for your Convert plan"

describe('ConvertLimitBanner', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render correctly', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        jest.spyOn(
            isConvertCampaignCappingEnabledHook,
            'useIsConvertCampaignCappingEnabled'
        ).mockImplementation(() => true)
        useGetConvertStatusMock.mockReturnValue(isLimitReached)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertLimitBanner />
            </Provider>
        )
        expect(queryByText(messageText, {exact: false})).toBeInTheDocument()
        expect(queryByText(buttonText)).toBeInTheDocument()
    })

    it('should not render because the bundle is not installed even the usage is limit-reached', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        jest.spyOn(
            isConvertCampaignCappingEnabledHook,
            'useIsConvertCampaignCappingEnabled'
        ).mockImplementation(() => true)
        useGetConvertStatusMock.mockReturnValue(isLimitReachedNoBundle)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertLimitBanner />
            </Provider>
        )

        expect(queryByText(messageText, {exact: false})).not.toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })

    it('should not render because usage is ok', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        jest.spyOn(
            isConvertCampaignCappingEnabledHook,
            'useIsConvertCampaignCappingEnabled'
        ).mockImplementation(() => true)
        useGetConvertStatusMock.mockReturnValue(isLimitOk)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertLimitBanner />
            </Provider>
        )

        expect(queryByText(messageText, {exact: false})).not.toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })

    it('should not render because flag is off', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        jest.spyOn(
            isConvertCampaignCappingEnabledHook,
            'useIsConvertCampaignCappingEnabled'
        ).mockImplementation(() => false)
        useGetConvertStatusMock.mockReturnValue(isLimitOk)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertLimitBanner />
            </Provider>
        )

        expect(queryByText(messageText, {exact: false})).not.toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })
})
