import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { billingState } from 'fixtures/billing'
import {
    convertStatusLimitReached,
    convertStatusLimitReachedNotInstalled,
    convertStatusOk,
    convertStatusOkWarning,
    convertStatusOkWarningUpgrade,
} from 'fixtures/convert'
import { user } from 'fixtures/users'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import { RootState } from 'state/types'

import { ConvertLimitBanner } from '../ConvertLimitBanner'

const defaultState = {
    currentUser: fromJS(user),
    billing: fromJS(billingState),
} as RootState
const store = createStore((state) => state as RootState, defaultState)

jest.mock('pages/convert/common/hooks/useGetConvertStatus')

const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

const blockedButtonText = 'Upgrade'
const blockedMessageText = "You've reached the limit for your Convert plan"

const warningAutoUpgradeButtonText = 'Learn more'
const warningAutoUpgradeMessageText = 'You will be auto-upgraded'

const warningButtonText = 'Activate auto-upgrade'
const warningMessageText = 'your campaigns won’t be displayed'

describe('ConvertLimitBanner', () => {
    beforeEach(() => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber',
        ).mockImplementation(() => true)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render correctly limit reached', () => {
        useGetConvertStatusMock.mockReturnValue(convertStatusLimitReached)

        const { queryByText } = render(
            <Provider store={store}>
                <ConvertLimitBanner />
            </Provider>,
        )
        expect(
            queryByText(blockedMessageText, { exact: false }),
        ).toBeInTheDocument()
        expect(queryByText(blockedButtonText)).toBeInTheDocument()
    })

    it('should not render because the bundle is not installed even the usage is limit-reached', () => {
        useGetConvertStatusMock.mockReturnValue(
            convertStatusLimitReachedNotInstalled,
        )

        const { queryByText } = render(
            <Provider store={store}>
                <ConvertLimitBanner />
            </Provider>,
        )

        expect(
            queryByText(blockedMessageText, { exact: false }),
        ).not.toBeInTheDocument()
        expect(queryByText(blockedButtonText)).not.toBeInTheDocument()
    })

    it('should not render because usage is ok', () => {
        useGetConvertStatusMock.mockReturnValue(convertStatusOk)

        const { queryByText } = render(
            <Provider store={store}>
                <ConvertLimitBanner />
            </Provider>,
        )

        expect(queryByText(blockedButtonText)).not.toBeInTheDocument()
        expect(queryByText(warningButtonText)).not.toBeInTheDocument()
        expect(
            queryByText(warningAutoUpgradeButtonText),
        ).not.toBeInTheDocument()
    })

    it('should render warning', () => {
        useGetConvertStatusMock.mockReturnValue(convertStatusOkWarning)

        const { queryByText } = render(
            <Provider store={store}>
                <ConvertLimitBanner />
            </Provider>,
        )

        expect(
            queryByText(warningMessageText, { exact: false }),
        ).toBeInTheDocument()
        expect(queryByText(warningButtonText)).toBeInTheDocument()
    })

    it('should render warning', () => {
        useGetConvertStatusMock.mockReturnValue(convertStatusOkWarning)

        const { queryByText } = render(
            <Provider store={store}>
                <ConvertLimitBanner />
            </Provider>,
        )

        expect(
            queryByText(warningMessageText, { exact: false }),
        ).toBeInTheDocument()
        expect(queryByText(warningButtonText)).toBeInTheDocument()
    })

    it('should render warning for upgrade', () => {
        useGetConvertStatusMock.mockReturnValue(convertStatusOkWarningUpgrade)

        const { queryByText } = render(
            <Provider store={store}>
                <ConvertLimitBanner />
            </Provider>,
        )

        expect(
            queryByText(warningAutoUpgradeMessageText, { exact: false }),
        ).toBeInTheDocument()
        expect(queryByText(warningAutoUpgradeButtonText)).toBeInTheDocument()
    })

    it('should not render because estimation is outside of cycle', () => {
        useGetConvertStatusMock.mockReturnValue({
            ...convertStatusOkWarningUpgrade,
            estimated_reach_date: '2023-04-01T00:00:00.000Z',
        })

        const { queryByText } = render(
            <Provider store={store}>
                <ConvertLimitBanner />
            </Provider>,
        )

        expect(
            queryByText(warningAutoUpgradeMessageText),
        ).not.toBeInTheDocument()
        expect(
            queryByText(warningAutoUpgradeButtonText),
        ).not.toBeInTheDocument()
    })
})
