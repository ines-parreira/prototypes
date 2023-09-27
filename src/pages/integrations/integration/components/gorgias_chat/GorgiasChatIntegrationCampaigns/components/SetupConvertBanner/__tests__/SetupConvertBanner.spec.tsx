import React from 'react'
import {render, waitFor} from '@testing-library/react'

import {Provider} from 'react-redux'
import {createStore} from 'redux'
import {fromJS} from 'immutable'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import * as hasConvertBundleInstalledUtil from 'pages/settings/revenue/utils/hasConvertBundleInstalled'
import {RootState} from 'state/types'
import {user} from 'fixtures/users'
import {AGENT_ROLE} from 'config/user'
import {SetupConvertBanner} from '../SetupConvertBanner'

const defaultState = {
    currentUser: fromJS(user),
} as RootState
const store = createStore((state) => state as RootState, defaultState)

const buttonText = 'Continue Setup'
const messageText = 'You have activated the Convert product'

describe('SetupConvertBanner', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render correctly', async () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        const hasConvertMock = jest
            .spyOn(hasConvertBundleInstalledUtil, 'hasConvertBundleInstalled')
            .mockImplementation(() => Promise.resolve(false))

        const {queryByText} = render(
            <Provider store={store}>
                <SetupConvertBanner />
            </Provider>
        )
        await waitFor(() => {
            expect(hasConvertMock).toHaveBeenCalled()
        })
        expect(queryByText(messageText, {exact: false})).toBeInTheDocument()
        expect(queryByText(buttonText)).toBeInTheDocument()
    })

    it('should not render because is not convert subscriber', () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => false)
        jest.spyOn(
            hasConvertBundleInstalledUtil,
            'hasConvertBundleInstalled'
        ).mockImplementation(() => Promise.resolve(false))

        const {queryByText} = render(
            <Provider store={store}>
                <SetupConvertBanner />
            </Provider>
        )
        expect(queryByText(messageText, {exact: false})).not.toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })

    it('should not render because has bundle installed', async () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        const hasConvertMock = jest
            .spyOn(hasConvertBundleInstalledUtil, 'hasConvertBundleInstalled')
            .mockImplementation(() => Promise.resolve(true))

        const {queryByText} = render(
            <Provider store={store}>
                <SetupConvertBanner />
            </Provider>
        )

        await waitFor(() => {
            expect(hasConvertMock).toHaveBeenCalled()
        })

        expect(queryByText(messageText, {exact: false})).not.toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })

    it('should render button if is not admin', async () => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
        const hasConvertMock = jest
            .spyOn(hasConvertBundleInstalledUtil, 'hasConvertBundleInstalled')
            .mockImplementation(() => Promise.resolve(false))

        const agentStore = createStore((state) => state as RootState, {
            currentUser: fromJS({
                ...user,
                role: {name: AGENT_ROLE},
            }),
        })

        const {queryByText} = render(
            <Provider store={agentStore}>
                <SetupConvertBanner />
            </Provider>
        )
        await waitFor(() => {
            expect(hasConvertMock).toHaveBeenCalled()
        })
        expect(queryByText(messageText, {exact: false})).toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })
})
