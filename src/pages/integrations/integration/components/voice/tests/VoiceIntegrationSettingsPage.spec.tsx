import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'

import { IntegrationType } from '@gorgias/api-client'
import {
    PhoneIntegration,
    useGetIntegration,
    useUpdateAllPhoneSettings,
} from '@gorgias/api-queries'

import { integrationsState } from 'fixtures/integrations'
import { RootState } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock, mockStore, renderWithRouter } from 'utils/testing'

import VoiceIntegrationSettingsPage from '../VoiceIntegrationSettingsPage'

const phoneIntegration = integrationsState.integrations.find(
    (integration) => integration.type === IntegrationType.Phone,
) as unknown as PhoneIntegration

jest.mock('../VoiceIntegrationSettingsForm', () => () => (
    <div>VoiceIntegrationSettingsForm</div>
))

jest.mock('@gorgias/api-queries')
const useGetIntegrationMock = assumeMock(useGetIntegration)
useGetIntegrationMock.mockReturnValue({
    data: { data: phoneIntegration },
    isLoading: false,
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
            isLoading: false,
        } as any)
        const { queryByText } = renderComponent({} as RootState)

        expect(queryByText('VoiceIntegrationSettingsForm')).toBeNull()
    })

    it('should not render while loading integration', () => {
        useGetIntegrationMock.mockReturnValue({
            data: { data: {} },
            isLoading: true,
        } as any)
        const { queryByText } = renderComponent({} as RootState)

        expect(queryByText('VoiceIntegrationSettingsForm')).toBeNull()
    })
})
