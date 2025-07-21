import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { GORGIAS_CHAT_INTEGRATION_TYPE } from 'constants/integration'
import { CampaignSettingType } from 'domains/reporting/pages/convert/components/CampaignTableStats/constants'
import { channelConnection } from 'fixtures/channelConnection'
import useAppDispatch from 'hooks/useAppDispatch'
import { useUpdateSetting } from 'models/convert/settings/queries'
import * as queries from 'models/convert/settings/queries'
import { useChatIntegration } from 'pages/convert/campaigns/hooks/useChatIntegration'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import { GeneralSettingsView } from 'pages/convert/settings/components/GeneralSettingsView'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

jest.mock('models/convert/settings/queries')
jest.mock('state/notifications/actions')
jest.mock('pages/convert/campaigns/hooks/useChatIntegration')
jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
jest.mock('pages/convert/campaigns/hooks/useChatIntegration')
jest.mock('hooks/useAppDispatch')

const mockUseAppDispatch = assumeMock(useAppDispatch)
const mockUseUpdateSettings = assumeMock(useUpdateSetting)
const mockNotify = assumeMock(notify)
const mockUseGetOrCreateChannelConnection = assumeMock(
    useGetOrCreateChannelConnection,
)
const mockChatIntegration = assumeMock(useChatIntegration)
const queryClient = mockQueryClient()

const mockStore = configureMockStore([thunk])

describe('<GeneralSettingsView />', () => {
    beforeEach(() => {
        mockUseGetOrCreateChannelConnection.mockReturnValue(
            channelConnection as any,
        )
        mockChatIntegration.mockReturnValue(
            fromJS({
                id: 2,
                type: GORGIAS_CHAT_INTEGRATION_TYPE,
            }) as Map<any, any>,
        )
        mockUseAppDispatch.mockReturnValue(jest.fn())
    })

    it('should handle submission when its successful', async () => {
        const mockQuery = jest.spyOn(queries, 'useGetSettingsList')
        mockQuery.mockReturnValue({ data: undefined, isLoading: false } as any)
        mockUseUpdateSettings.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as any)
        const { getByText } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <GeneralSettingsView />
                </Provider>
            </QueryClientProvider>,
        )
        const submitButton = getByText('Save Changes')
        await waitFor(() => submitButton.click())
        expect(mockNotify).toHaveBeenCalledWith({
            status: NotificationStatus.Success,
            message: 'Settings updated.',
        })
    })

    it('should handle submission when it results in an error', async () => {
        const mockQuery = jest.spyOn(queries, 'useGetSettingsList')
        mockQuery.mockReturnValue({ data: undefined, isLoading: false } as any)
        mockUseUpdateSettings.mockReturnValue({
            mutateAsync: () => {
                throw Error()
            },
            isLoading: false,
        } as any)
        const { getByText } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <GeneralSettingsView />
                </Provider>
            </QueryClientProvider>,
        )
        const submitButton = getByText('Save Changes')
        await waitFor(() => submitButton.click())
        expect(mockNotify).toHaveBeenCalledWith({
            status: NotificationStatus.Error,
            message: 'An unexpected error happened.',
        })
    })

    it('should render loading when its loading', () => {
        const mockQuery = jest.spyOn(queries, 'useGetSettingsList')
        mockQuery.mockReturnValue({ data: undefined, isLoading: true } as any)
        mockUseUpdateSettings.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as any)
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <GeneralSettingsView />
                </Provider>
            </QueryClientProvider>,
        )
        expect(
            container.getElementsByClassName('md-spin')[0],
        ).toBeInTheDocument()
    })

    it('should show a loading button when submission is loading', () => {
        const mockQuery = jest.spyOn(queries, 'useGetSettingsList')
        mockQuery.mockReturnValue({ data: undefined, isLoading: false } as any)
        mockUseUpdateSettings.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: true,
        } as any)
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <GeneralSettingsView />
                </Provider>
            </QueryClientProvider>,
        )
        expect(
            container.getElementsByClassName('spinner')[0],
        ).toBeInTheDocument()
    })

    it('should pre-populate when values are fetched', () => {
        const mockQuery = jest.spyOn(queries, 'useGetSettingsList')
        mockQuery.mockReturnValue({
            data: [
                {
                    type: CampaignSettingType.EmailDisclaimer,
                    data: {
                        enabled: true,
                        disclaimer: { en: 'foo' },
                        disclaimer_default_accepted: true,
                    },
                },
            ],
            isLoading: false,
        } as any)
        mockUseUpdateSettings.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as any)
        const { getByRole } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <GeneralSettingsView />
                </Provider>
            </QueryClientProvider>,
        )
        const toggle = getByRole('switch', {
            name: /Email privacy policy disclaimer/i,
        })
        expect(toggle).toBeChecked()
    })

    it('campaign frequency section is visible', () => {
        const { getByText } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <GeneralSettingsView />
                </Provider>
            </QueryClientProvider>,
        )

        expect(getByText('Frequency Settings')).toBeInTheDocument()
    })
})
