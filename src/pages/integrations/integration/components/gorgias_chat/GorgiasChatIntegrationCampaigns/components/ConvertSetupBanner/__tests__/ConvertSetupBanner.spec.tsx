import React from 'react'
import {render} from '@testing-library/react'

import {Provider} from 'react-redux'
import {createStore} from 'redux'
import {fromJS} from 'immutable'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import * as isConvertCampaignBundleWarningEnabledHook from 'pages/settings/revenue/hooks/useIsConvertCampaignBundleWarningEnabled'
import {RootState} from 'state/types'
import {user} from 'fixtures/users'
import {AGENT_ROLE} from 'config/user'
import {assumeMock} from 'utils/testing'
import useGetConvertStatus from 'pages/settings/revenue/hooks/useGetConvertStatus'
import {convertStatusNotInstalled, convertStatusOk} from 'fixtures/convert'
import {ConvertSetupBanner} from '../ConvertSetupBanner'

const defaultState = {
    currentUser: fromJS(user),
} as RootState
const store = createStore((state) => state as RootState, defaultState)

const buttonText = 'Continue Setup'
const subscribedMessageText = 'Ensure proper campaign functionality'
const unsubscribedMessageText = 'Install Convert on your store before January 1'

jest.mock('pages/settings/revenue/hooks/useGetConvertStatus')
const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

describe('ConvertSetupBanner', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render correctly for subscriber', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        useGetConvertStatusMock.mockReturnValue(convertStatusNotInstalled)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertSetupBanner />
            </Provider>
        )

        expect(
            queryByText(subscribedMessageText, {exact: false})
        ).toBeInTheDocument()
        expect(queryByText(buttonText)).toBeInTheDocument()
    })

    it('should render correctly for non subscriber', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)
        jest.spyOn(
            isConvertCampaignBundleWarningEnabledHook,
            'useIsConvertCampaignBundleWarningEnabled'
        ).mockImplementation(() => true)

        useGetConvertStatusMock.mockReturnValue(convertStatusNotInstalled)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertSetupBanner />
            </Provider>
        )

        expect(
            queryByText(unsubscribedMessageText, {exact: false})
        ).toBeInTheDocument()
        expect(queryByText(buttonText)).toBeInTheDocument()
    })

    it('should not render render because banner feature flag is not enabled', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)
        jest.spyOn(
            isConvertCampaignBundleWarningEnabledHook,
            'useIsConvertCampaignBundleWarningEnabled'
        ).mockImplementation(() => false)

        useGetConvertStatusMock.mockReturnValue(convertStatusNotInstalled)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertSetupBanner />
            </Provider>
        )

        expect(
            queryByText(unsubscribedMessageText, {exact: false})
        ).not.toBeInTheDocument()
    })

    it('should not render because has bundle installed', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        useGetConvertStatusMock.mockReturnValue(convertStatusOk)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertSetupBanner />
            </Provider>
        )

        expect(
            queryByText(subscribedMessageText, {exact: false})
        ).not.toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })

    it('should render button if is not admin', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        useGetConvertStatusMock.mockReturnValue(convertStatusNotInstalled)

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
        expect(
            queryByText(subscribedMessageText, {exact: false})
        ).toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })
})
