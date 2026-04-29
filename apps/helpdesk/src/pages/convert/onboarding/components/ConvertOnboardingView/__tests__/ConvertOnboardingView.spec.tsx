import { history } from '@repo/routing'
import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import type routerDom from 'react-router-dom'
import { useParams } from 'react-router-dom'

import { channelConnection } from 'fixtures/channelConnection'
import { convertBundle } from 'fixtures/convertBundle'
import { useListBundles } from 'models/convert/bundle/queries'
import { NavigatedSuccessModalName } from 'pages/common/components/SuccessModal/NavigatedSuccessModal'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'

import ConvertOnboardingView from '../ConvertOnboardingView'

const defaultStateShopify = {
    integrations: fromJS({
        integrations: [
            {
                id: 123,
                type: 'gorgias_chat',
                meta: { shop_integration_id: 234 },
            },
            { id: 234, type: 'shopify' },
        ],
    }),
}

const defaultStateNoShopify = {
    integrations: fromJS({
        integrations: [{ id: 123, type: 'gorgias_chat' }],
    }),
}

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

jest.mock('models/convert/bundle/queries')
const useListBundlesMock = assumeMock(useListBundles)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)

jest.mock('pages/convert/common/hooks/useConvertApi', () => ({
    useConvertApi: jest.fn(() => ({
        client: jest.fn(),
    })),
}))

let useIsConvertSubscriberMock: jest.SpyInstance

describe('<ConvertOnboardingView />', () => {
    const mockUseIsConvertSubscriber = (isConvertSubscriber: boolean) => {
        useIsConvertSubscriberMock = jest
            .spyOn(isConvertSubscriberHook, 'useIsConvertSubscriber')
            .mockImplementation(() => isConvertSubscriber)
    }

    beforeEach(() => {})

    afterEach(() => {
        useIsConvertSubscriberMock.mockRestore()
    })

    it.each([
        [true, defaultStateShopify, 3],
        [false, defaultStateShopify, 2],
        [true, defaultStateNoShopify, 2],
        [false, defaultStateNoShopify, 2],
    ])(
        'redirects to campaigns page when onboarding is done',
        async (isSubscriber, defaultState, completedSteps) => {
            // Mock useParams
            ;(useParams as jest.Mock).mockReturnValue({ id: '123' })

            // Mock useGetOrCreateChannelConnection
            useGetOrCreateChannelConnectionMock.mockReturnValue({
                channelConnection: {
                    ...channelConnection,
                    is_onboarded: isSubscriber,
                    is_setup: !isSubscriber,
                },
            } as any)

            // Mock useIsConvertSubscriber
            mockUseIsConvertSubscriber(isSubscriber)

            // Mock useListBundles
            useListBundlesMock.mockReturnValue({
                data: [convertBundle],
            } as any)

            const spy = jest.spyOn(history, 'push')

            const { queryByText } = render(<ConvertOnboardingView />, {
                storeState: defaultState,
            })

            expect(screen.getAllByLabelText('Step completed')).toHaveLength(
                completedSteps,
            )

            // Ensure redirection happens
            await waitFor(() => {
                expect(spy.mock.calls).toEqual([
                    [
                        '/app/convert/123/campaigns',
                        {
                            showModal:
                                NavigatedSuccessModalName.ConvertOnboarding,
                        },
                    ],
                ])
            })

            const button = 'Get started with campaigns'
            if (completedSteps === 3) {
                expect(queryByText(button)).not.toBeInTheDocument()
            } else {
                expect(queryByText(button)).toBeInTheDocument()
            }
        },
    )
})
