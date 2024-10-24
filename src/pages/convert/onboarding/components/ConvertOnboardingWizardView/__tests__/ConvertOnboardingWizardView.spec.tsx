import {QueryClientProvider} from '@tanstack/react-query'
import {render, fireEvent, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import routerDom, {BrowserRouter, useParams} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import {account} from 'fixtures/account'
import {billingState} from 'fixtures/billing'
import {campaign} from 'fixtures/campaign'
import {channelConnection} from 'fixtures/channelConnection'
import {
    convertBundle,
    installBundleMockImplementation,
} from 'fixtures/convertBundle'
import {
    useCreateCampaign,
    useListCampaigns,
} from 'models/convert/campaign/queries'
import {NavigatedSuccessModalName} from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import {useGetConvertBundle} from 'pages/convert/bundles/hooks/useGetConvertBundle'
import {useInstallBundle} from 'pages/convert/bundles/hooks/useInstallBundle'
import {CampaignConfigurationBuilder} from 'pages/convert/campaigns/templates/constructor'
import {useUpdateChannelConnection} from 'pages/convert/channelConnections/hooks/useUpdateChannelConnection'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import history from 'pages/history'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import ConvertOnboardingWizardView from '../ConvertOnboardingWizardView'

const queryClient = mockQueryClient()

const mockStore = configureMockStore()

jest.mock('pages/convert/channelConnections/hooks/useUpdateChannelConnection')
const useUpdateChannelConnectionMock = assumeMock(useUpdateChannelConnection)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)
const useCreateCampaignMock = assumeMock(useCreateCampaign)

jest.mock('pages/convert/bundles/hooks/useGetConvertBundle')
const useGetConvertBundleMock = assumeMock(useGetConvertBundle)

jest.mock('pages/convert/bundles/hooks/useInstallBundle')
const useInstallBundleMock = assumeMock(useInstallBundle)

jest.mock(
    'pages/convert/onboarding/components/ConvertSimplifiedEditorModal',
    () => {
        return jest.fn(() => {
            return <div data-testid="mock-simplified-editor-modal" />
        })
    }
)

jest.mock('pages/convert/campaigns/templates/constructor')

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

const defaultState = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [{id: 123, type: 'gorgias_chat', meta: {}}],
    }),
}

describe('ConvertOnboardingWizardView', () => {
    beforeEach(() => {
        useGetConvertBundleMock.mockReturnValue({
            bundle: convertBundle,
            isLoading: false,
        })
        useInstallBundleMock.mockImplementation(installBundleMockImplementation)
        ;(
            CampaignConfigurationBuilder.prototype
                .attachProductCards as jest.Mock
        ).mockImplementation(jest.fn())
        ;(
            CampaignConfigurationBuilder.getOrCreateDiscountCode as jest.Mock
        ).mockImplementation(jest.fn())
    })

    it('updated channel connection on finish setup', async () => {
        ;(useParams as jest.Mock).mockReturnValue({id: '123'})
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: {
                ...channelConnection,
                is_onboarded: false,
            },
        } as any)

        useListCampaignMock.mockReturnValue({
            data: [campaign],
            isLoading: false,
            isError: false,
        } as any)

        const mutateUpdateMock = jest.fn()
        useUpdateChannelConnectionMock.mockImplementation(() => {
            return {
                mutateAsync: mutateUpdateMock,
            } as unknown as ReturnType<typeof useUpdateChannelConnection>
        })

        const mutateCreateCampaignMock = jest.fn()
        useCreateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: mutateCreateCampaignMock,
            } as unknown as ReturnType<typeof useCreateCampaign>
        })

        const {getByText} = render(
            <BrowserRouter>
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <ConvertOnboardingWizardView />
                    </QueryClientProvider>
                </Provider>
            </BrowserRouter>
        )

        const finishSetupButton = getByText('Finish Setup')
        fireEvent.click(finishSetupButton)

        await waitFor(() => {
            expect(mutateUpdateMock).toHaveBeenCalledWith([
                undefined,
                {
                    channel_connection_id: channelConnection.id,
                },
                {
                    is_onboarded: true,
                },
            ])
        })

        expect(mutateCreateCampaignMock).toHaveBeenCalledTimes(3)
    })
    it('redirects to campaigns page after setup if channel is onboarded', async () => {
        ;(useParams as jest.Mock).mockReturnValue({id: '123'})
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: {
                ...channelConnection,
                is_onboarded: true,
            },
        } as any)

        const mutateCampaignCreateMock = jest.fn()
        useCreateCampaignMock.mockImplementation(() => {
            return {
                mutateAsync: mutateCampaignCreateMock,
            } as unknown as ReturnType<typeof useCreateCampaign>
        })

        const spy = jest.spyOn(history, 'push')

        render(
            <BrowserRouter>
                <Provider store={mockStore(defaultState)}>
                    <QueryClientProvider client={queryClient}>
                        <ConvertOnboardingWizardView />
                    </QueryClientProvider>
                </Provider>
            </BrowserRouter>
        )

        // Ensure redirection happens
        await waitFor(() => {
            expect(spy.mock.calls).toEqual([
                [
                    '/app/convert/123/campaigns',
                    {
                        showModal: NavigatedSuccessModalName.ConvertOnboarding,
                    },
                ],
            ])
        })
    })
})
