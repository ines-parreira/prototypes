import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import {Router} from 'react-router-dom'
import {createMemoryHistory} from 'history'
import {QueryClientProvider} from '@tanstack/react-query'
import {Language} from 'constants/languages'
import {channelConnection} from 'fixtures/channelConnection'
import {shopifyIntegration} from 'fixtures/integrations'
import {OnboardingWizardSteps} from 'pages/convert/onboarding/components/ConvertOnboardingWizardView/constants'
import {assumeMock, flushPromises} from 'utils/testing'
import {useInstallBundle} from 'pages/convert/bundles/hooks/useInstallBundle'
import {installBundleMockImplementation} from 'fixtures/convertBundle'
import {useUpdateChannelConnection} from 'pages/convert/channelConnections/hooks/useUpdateChannelConnection'
import {
    useCreateCampaign,
    useListCampaigns,
} from 'models/convert/campaign/queries'
import Wizard from 'pages/common/components/wizard/Wizard'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import WizardLayout from '../WizardLayout'

const queryClient = mockQueryClient()

jest.mock('pages/convert/bundles/hooks/useInstallBundle')
const useInstallBundleMock = assumeMock(useInstallBundle)

jest.mock('pages/convert/channelConnections/hooks/useUpdateChannelConnection')
const useUpdateChannelConnectionMock = assumeMock(useUpdateChannelConnection)

jest.mock('models/convert/campaign/queries')
const useCreateCampaignMock = assumeMock(useCreateCampaign)
const useListCampaignsMock = assumeMock(useListCampaigns)

jest.mock('pages/convert/bundles/components/ConvertInstallModal', () => {
    return jest.fn(() => <div>ConvertInstallModal</div>)
})
jest.mock(
    'pages/convert/onboarding/components/ConvertOnboardingWizardView/components/WizardCampaignsStep',
    () => {
        return jest.fn(() => <div>WizardCampaignsStep</div>)
    }
)
jest.mock(
    'pages/convert/onboarding/components/ConvertOnboardingWizardView/components/WizardInstallStep',
    () => {
        return jest.fn(() => <div>WizardInstallStep</div>)
    }
)

const integration = {
    id: 123,
    meta: {
        languages: [
            {language: Language.FrenchFr, primary: true},
            {language: Language.EnglishUs},
        ],
    },
}

describe('WizardLayout', () => {
    test('renders correctly and handles next step', () => {
        useInstallBundleMock.mockImplementation(installBundleMockImplementation)

        const mutateUpdateMock = jest.fn()
        useUpdateChannelConnectionMock.mockImplementation(() => {
            return {
                mutateAsync: mutateUpdateMock,
            } as unknown as ReturnType<typeof useUpdateChannelConnection>
        })

        useListCampaignsMock.mockReturnValue({data: []} as any)
        useCreateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useCreateCampaign>
        })

        const steps = Object.values(OnboardingWizardSteps)

        const history = createMemoryHistory()

        const {getByText} = render(
            <Router history={history}>
                <QueryClientProvider client={queryClient}>
                    <Wizard
                        steps={steps}
                        startAt={OnboardingWizardSteps.Campaigns}
                    >
                        <WizardLayout
                            steps={steps}
                            integration={fromJS({id: 123})}
                            channelConnection={channelConnection}
                            storeIntegration={fromJS(shopifyIntegration)}
                        />
                    </Wizard>
                </QueryClientProvider>
            </Router>
        )

        expect(getByText('Campaigns')).toBeInTheDocument()
        expect(getByText('Install bundle')).toBeInTheDocument()

        expect(getByText('WizardCampaignsStep')).toBeInTheDocument()

        fireEvent.click(getByText('Finish Setup'))
        expect(getByText('WizardInstallStep')).toBeInTheDocument()

        fireEvent.click(getByText('Previous'))
        expect(getByText('WizardCampaignsStep')).toBeInTheDocument()
    })

    test('can click finish setup only once', async () => {
        useInstallBundleMock.mockImplementation(installBundleMockImplementation)
        useListCampaignsMock.mockReturnValue({data: []} as any)

        const mutateUpdateMock = jest.fn()
        useUpdateChannelConnectionMock.mockImplementation(() => {
            return {
                mutateAsync: mutateUpdateMock,
                isLoading: true,
            } as unknown as ReturnType<typeof useUpdateChannelConnection>
        })

        const createCampaignMock = jest.fn()
        useCreateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: createCampaignMock,
                isLoading: true,
            } as unknown as ReturnType<typeof useCreateCampaign>
        })

        // Just have one step to force onFinish handler
        const steps = [OnboardingWizardSteps.Campaigns]

        const history = createMemoryHistory()

        render(
            <Router history={history}>
                <QueryClientProvider client={queryClient}>
                    <Wizard
                        steps={steps}
                        startAt={OnboardingWizardSteps.Campaigns}
                    >
                        <WizardLayout
                            steps={steps}
                            integration={fromJS(integration)}
                            channelConnection={channelConnection}
                            storeIntegration={fromJS(shopifyIntegration)}
                        />
                    </Wizard>
                </QueryClientProvider>
            </Router>
        )

        const submitButton = screen.getByRole('button', {
            name: 'Loading... Finish Setup',
        })
        expect(submitButton).toBeAriaDisabled()

        submitButton.setAttribute('aria-disabled', '')
        submitButton.removeAttribute('class')
        submitButton.click()

        await flushPromises()

        await waitFor(() => {
            expect(mutateUpdateMock).not.toBeCalled()
            expect(createCampaignMock).not.toBeCalled()
        })
    })
})
