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
import {channelConnection} from 'fixtures/channelConnection'
import {useIsConvertOnboardingUiEnabled} from 'pages/convert/common/hooks/useIsConvertOnboardingUiEnabled'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {ConvertSetupBanner} from '../ConvertSetupBanner'

const defaultState = {
    currentUser: fromJS(user),
} as RootState
const store = createStore((state) => state as RootState, defaultState)

const buttonText = 'Complete installation'
const messageText = "you haven't completed the campaign bundle installation"

jest.mock('pages/settings/revenue/hooks/useGetConvertStatus')
const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

jest.mock('pages/convert/common/hooks/useIsConvertOnboardingUiEnabled')
const useIsConvertOnboardingUiEnabledMock = assumeMock(
    useIsConvertOnboardingUiEnabled
)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

describe('ConvertSetupBanner', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    beforeEach(() => {
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: {
                ...channelConnection,
                is_onboarded: true,
            },
        } as any)
        useIsConvertOnboardingUiEnabledMock.mockReturnValue(false)
    })

    it('should render correctly for subscriber', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        useGetConvertStatusMock.mockReturnValue(convertStatusNotInstalled)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertSetupBanner chatIntegrationId={1} />
            </Provider>
        )

        expect(queryByText(messageText, {exact: false})).toBeInTheDocument()
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
                <ConvertSetupBanner chatIntegrationId={1} />
            </Provider>
        )

        expect(queryByText(messageText, {exact: false})).toBeInTheDocument()
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
                <ConvertSetupBanner chatIntegrationId={1} />
            </Provider>
        )

        expect(queryByText(messageText, {exact: false})).not.toBeInTheDocument()
    })

    it('should not render because has bundle installed', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        useGetConvertStatusMock.mockReturnValue(convertStatusOk)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertSetupBanner chatIntegrationId={1} />
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

        useGetConvertStatusMock.mockReturnValue(convertStatusNotInstalled)

        const agentStore = createStore((state) => state as RootState, {
            currentUser: fromJS({
                ...user,
                role: {name: AGENT_ROLE},
            }),
        })

        const {queryByText} = render(
            <Provider store={agentStore}>
                <ConvertSetupBanner chatIntegrationId={1} />
            </Provider>
        )
        expect(queryByText(messageText, {exact: false})).toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })

    it('should not render when onboarding is not finished', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)

        useGetConvertStatusMock.mockReturnValue(convertStatusNotInstalled)

        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)
        useIsConvertOnboardingUiEnabledMock.mockReturnValue(true)

        const {queryByText} = render(
            <Provider store={store}>
                <ConvertSetupBanner chatIntegrationId={1} />
            </Provider>
        )

        expect(queryByText(messageText, {exact: false})).not.toBeInTheDocument()
    })
})
