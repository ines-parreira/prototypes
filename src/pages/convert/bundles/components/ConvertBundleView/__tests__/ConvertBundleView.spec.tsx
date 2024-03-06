import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import routerDom, {MemoryRouter, useParams} from 'react-router-dom'
import {Provider} from 'react-redux'
import {QueryClientProvider} from '@tanstack/react-query'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'
import {useListBundles} from 'models/convert/bundle/queries'
import {convertBundle} from 'fixtures/convertBundle'
import ConvertBundleView from '../ConvertBundleView'

const queryClient = mockQueryClient()

const mockStore = configureMockStore()

const defaultState = {
    integrations: fromJS({
        integrations: [
            {id: 123, type: 'gorgias_chat', meta: {shop_integration_id: 234}},
            {id: 234, type: 'shopify'},
        ],
    }),
}

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

jest.mock('models/convert/bundle/queries')
const useListBundlesMock = assumeMock(useListBundles)

describe('ConvertBundleView Component', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    it('renders installation method selection when is installed', async () => {
        // Mock useParams
        ;(useParams as jest.Mock).mockReturnValue({id: '123'})

        // Mock useListBundles
        useListBundlesMock.mockReturnValue({
            data: [convertBundle],
        } as any)

        render(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <ConvertBundleView />
                    </Provider>
                </QueryClientProvider>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('forum')).toBeInTheDocument()
            expect(
                screen.getByText('1-click installation for Shopify')
            ).toBeInTheDocument()
            expect(screen.getByText('Manual installation')).toBeInTheDocument()
        })
    })

    it('renders installation method selection when not installed', async () => {
        // Mock useParams
        ;(useParams as jest.Mock).mockReturnValue({id: '123'})

        // Mock useListBundles
        useListBundlesMock.mockReturnValue({
            data: [],
        } as any)

        render(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <ConvertBundleView />
                    </Provider>
                </QueryClientProvider>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Select installation method for the Campaign bundle'
                )
            ).toBeInTheDocument()
            expect(screen.getByText('1-click install')).toBeInTheDocument()
            expect(screen.getByText('Manual install')).toBeInTheDocument()
        })
    })
})
