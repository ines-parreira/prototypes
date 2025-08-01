import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'

import { IntegrationType } from '@gorgias/helpdesk-client'
import {
    PhoneIntegration,
    useGetIntegration,
    useUpdateAllPhoneSettings,
} from '@gorgias/helpdesk-queries'

import { integrationsState } from 'fixtures/integrations'
import history from 'pages/history'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import VoiceIntegrationSettingsPage from '../VoiceIntegrationSettingsPage'

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone,
) as unknown as PhoneIntegration

jest.mock('../VoiceIntegrationSettingsForm', () => () => (
    <div>VoiceIntegrationSettingsForm</div>
))

const mockNotify = {
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

jest.mock('pages/history')

jest.mock('@gorgias/helpdesk-queries')
const useGetIntegrationMock = assumeMock(useGetIntegration)
useGetIntegrationMock.mockReturnValue({
    data: { data: phoneIntegration },
    isFetching: false,
} as any)

const useUpdateAllPhoneSettingsMock = assumeMock(useUpdateAllPhoneSettings)
useUpdateAllPhoneSettingsMock.mockReturnValue({ mutate: jest.fn() } as any)

describe('VoiceIntegrationSettings', () => {
    const renderComponent = (storeState: RootState) => {
        return renderWithRouter(
            <QueryClientProvider client={mockQueryClient()}>
                <Provider store={mockStore(storeState)}>
                    <VoiceIntegrationSettingsPage />
                </Provider>
            </QueryClientProvider>,
        )
    }

    it('should render', () => {
        const { getByText } = renderComponent({} as RootState)

        expect(getByText('VoiceIntegrationSettingsForm')).toBeInTheDocument()
    })

    it('should not render without valid integration', () => {
        useGetIntegrationMock.mockReturnValue({
            data: { data: {} },
            isFetching: false,
        } as any)
        const { queryByText } = renderComponent({} as RootState)

        expect(queryByText('VoiceIntegrationSettingsForm')).toBeNull()
    })

    it('should redirect to phone integrations page if get integration fails', () => {
        useGetIntegrationMock.mockReturnValue({
            data: { data: {} },
            isFetching: false,
            isError: true,
        } as any)
        const { queryByText } = renderComponent({} as RootState)

        expect(queryByText('VoiceIntegrationSettingsForm')).toBeNull()
        expect(mockNotify.error).toHaveBeenCalledWith(
            'Failed to fetch integration',
        )
        expect(history.push).toHaveBeenCalledWith(PHONE_INTEGRATION_BASE_URL)
    })

    it('should not render while loading integration', () => {
        useGetIntegrationMock.mockReturnValue({
            data: { data: {} },
            isFetching: true,
        } as any)
        const { queryByText } = renderComponent({} as RootState)

        expect(queryByText('VoiceIntegrationSettingsForm')).toBeNull()
    })
})
