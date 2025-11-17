import { assumeMock } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { AGENT_ROLE } from 'config/user'
import { channelConnection } from 'fixtures/channelConnection'
import { convertStatusNotInstalled, convertStatusOk } from 'fixtures/convert'
import { user } from 'fixtures/users'
import useGetConvertStatus from 'pages/convert/common/hooks/useGetConvertStatus'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import type { RootState } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { ConvertSetupBanner } from '../ConvertSetupBanner'

const defaultState = {
    currentUser: fromJS(user),
} as RootState
const store = createStore((state) => state as RootState, defaultState)

const buttonText = 'Complete installation'
const messageText = "you haven't completed the campaign bundle installation"

jest.mock('pages/convert/common/hooks/useGetConvertStatus')
const useGetConvertStatusMock = assumeMock(useGetConvertStatus)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
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
    })

    it('should render correctly for everyone', () => {
        useGetConvertStatusMock.mockReturnValue(convertStatusNotInstalled)

        const { queryByText } = renderWithRouter(
            <Provider store={store}>
                <ConvertSetupBanner chatIntegrationId={1} />
            </Provider>,
        )

        expect(queryByText(messageText, { exact: false })).toBeInTheDocument()
        expect(queryByText(buttonText)).toBeInTheDocument()
    })

    it('should not render because has bundle installed', () => {
        useGetConvertStatusMock.mockReturnValue(convertStatusOk)

        const { queryByText } = renderWithRouter(
            <Provider store={store}>
                <ConvertSetupBanner chatIntegrationId={1} />
            </Provider>,
        )

        expect(
            queryByText(messageText, { exact: false }),
        ).not.toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })

    it('should render button if is not admin', () => {
        useGetConvertStatusMock.mockReturnValue(convertStatusNotInstalled)

        const agentStore = createStore((state) => state as RootState, {
            currentUser: fromJS({
                ...user,
                role: { name: AGENT_ROLE },
            }),
        })

        const { queryByText } = renderWithRouter(
            <Provider store={agentStore}>
                <ConvertSetupBanner chatIntegrationId={1} />
            </Provider>,
        )
        expect(queryByText(messageText, { exact: false })).toBeInTheDocument()
        expect(queryByText(buttonText)).not.toBeInTheDocument()
    })

    it('should not render when onboarding is not finished', () => {
        useGetConvertStatusMock.mockReturnValue(convertStatusNotInstalled)

        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)

        const { queryByText } = renderWithRouter(
            <Provider store={store}>
                <ConvertSetupBanner chatIntegrationId={1} />
            </Provider>,
        )

        expect(
            queryByText(messageText, { exact: false }),
        ).not.toBeInTheDocument()
    })
})
