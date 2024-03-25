import React from 'react'
import {render, fireEvent, waitFor} from '@testing-library/react'
import routerDom, {BrowserRouter, useParams} from 'react-router-dom'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {assumeMock} from 'utils/testing'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import {channelConnection} from 'fixtures/channelConnection'
import {useUpdateChannelConnection} from 'pages/convert/channelConnections/hooks/useUpdateChannelConnection'
import history from 'pages/history'
import {campaign} from 'fixtures/campaign'
import {useListCampaigns} from 'models/convert/campaign/queries'
import {useGetConvertBundle} from 'pages/convert/bundles/hooks/useGetConvertBundle'
import {
    convertBundle,
    installBundleMockImplementation,
} from 'fixtures/convertBundle'
import {useInstallBundle} from 'pages/convert/bundles/hooks/useInstallBundle'
import ConvertOnboardingWizardView from '../ConvertOnboardingWizardView'

const mockStore = configureMockStore()

jest.mock('pages/convert/channelConnections/hooks/useUpdateChannelConnection')
const useUpdateChannelConnectionMock = assumeMock(useUpdateChannelConnection)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('models/convert/campaign/queries')
const useListCampaignMock = assumeMock(useListCampaigns)

jest.mock('pages/convert/bundles/hooks/useGetConvertBundle')
const useGetConvertBundleMock = assumeMock(useGetConvertBundle)

jest.mock('pages/convert/bundles/hooks/useInstallBundle')
const useInstallBundleMock = assumeMock(useInstallBundle)

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

const defaultState = {
    integrations: fromJS({
        integrations: [{id: 123, type: 'gorgias_chat'}],
    }),
}

describe('ConvertOnboardingWizardView', () => {
    beforeEach(() => {
        useGetConvertBundleMock.mockReturnValue({
            bundle: convertBundle,
            isLoading: false,
        })
        useInstallBundleMock.mockImplementation(installBundleMockImplementation)
    })

    it('updated channel connection on finish setup', () => {
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

        const {getByText} = render(
            <BrowserRouter>
                <Provider store={mockStore(defaultState)}>
                    <ConvertOnboardingWizardView />
                </Provider>
            </BrowserRouter>
        )

        const finishSetupButton = getByText('Finish Setup')
        fireEvent.click(finishSetupButton)

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
    it('redirects to campaigns page after setup if channel is onboarded', async () => {
        ;(useParams as jest.Mock).mockReturnValue({id: '123'})
        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: {
                ...channelConnection,
                is_onboarded: true,
            },
        } as any)

        const spy = jest.spyOn(history, 'push')

        render(
            <BrowserRouter>
                <Provider store={mockStore(defaultState)}>
                    <ConvertOnboardingWizardView />
                </Provider>
            </BrowserRouter>
        )

        // Ensure redirection happens
        await waitFor(() => {
            expect(spy.mock.calls).toEqual([
                ['/app/convert/123/campaigns#onboarding-complete'],
            ])
        })
    })
})
