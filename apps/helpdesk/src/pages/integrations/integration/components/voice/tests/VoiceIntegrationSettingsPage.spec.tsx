import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { useLocation } from 'react-router-dom'

import type { PhoneIntegration } from '@gorgias/helpdesk-queries'
import {
    useGetIntegration,
    useUpdateAllPhoneSettings,
} from '@gorgias/helpdesk-queries'
import { IntegrationType } from '@gorgias/helpdesk-types'

import { integrationsState } from 'fixtures/integrations'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

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
jest.mock('@gorgias/helpdesk-queries')
const useGetIntegrationMock = assumeMock(useGetIntegration)
useGetIntegrationMock.mockReturnValue({
    data: { data: phoneIntegration },
    isFetching: false,
} as any)
const useUpdateAllPhoneSettingsMock = assumeMock(useUpdateAllPhoneSettings)
useUpdateAllPhoneSettingsMock.mockReturnValue({ mutate: jest.fn() } as any)
const CurrentPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}
describe('VoiceIntegrationSettings', () => {
    const renderComponent = (storeState: RootState) => {
        return render(
            <>
                <VoiceIntegrationSettingsPage />
                <CurrentPath />
            </>,
            {
                initialEntries: ['/app/settings/channels/phone/1/preferences'],
                path: '/app/settings/channels/phone/:integrationId?/:tab?',
                storeState: mockStore(storeState).getState() as object,
            },
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
        expect(screen.getByLabelText('Current path')).toHaveTextContent(
            PHONE_INTEGRATION_BASE_URL,
        )
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
