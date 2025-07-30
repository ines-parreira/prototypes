import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useTrackstarLink } from '@trackstar/react-trackstar-link'

import {
    useCreateTrackstarLink,
    useCreateTrackstarToken,
    useListTrackstarConnections,
} from 'models/workflows/queries'

import StoreTrackstarProvider from '../../../../../../aiAgent/actions/providers/StoreTrackstarProvider'
import ConnectTrackstarButton from '../ConnectTrackstarButton'

jest.mock('models/workflows/queries')
jest.mock('@trackstar/react-trackstar-link')

const mockUseCreateTrackstarLink = jest.mocked(useCreateTrackstarLink)
const mockUseCreateTrackstarToken = jest.mocked(useCreateTrackstarToken)
const mockUseListTrackstarConnections = jest.mocked(useListTrackstarConnections)
const mockUseTrackstarLink = jest.mocked(useTrackstarLink)

describe('<ConnectTrackstarButton />', () => {
    const mockApp = {
        id: 'app-id',
        name: 'Test App',
    }

    const mockTrackstarLink = {
        open: jest.fn(),
        error: null,
    }

    const mockActionApp = {
        id: 'action-app-id',
        auth_type: 'trackstar',
        auth_settings: {
            integration_name: 'sandbox',
        },
    } as const

    const mockCreateLink = jest.fn().mockResolvedValue({
        data: { link_token: 'test-link-token' },
    })

    const mockCreateToken = jest.fn().mockResolvedValue({})

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseListTrackstarConnections.mockReturnValue({
            data: {},
            remove: jest.fn(),
            refetch: jest.fn(),
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useListTrackstarConnections>)
        mockUseCreateTrackstarLink.mockReturnValue({
            mutateAsync: mockCreateLink,
        } as any)
        mockUseCreateTrackstarToken.mockReturnValue({
            mutateAsync: mockCreateToken,
        } as any)
        mockUseTrackstarLink.mockReturnValue(mockTrackstarLink)
    })

    it('renders connect button when no connection exists', () => {
        render(
            <StoreTrackstarProvider storeName="test-store" storeType="shopify">
                <ConnectTrackstarButton
                    app={mockApp as any}
                    actionApp={mockActionApp}
                />
            </StoreTrackstarProvider>,
        )

        expect(screen.getByText(`Connect ${mockApp.name}`)).toBeInTheDocument()
        expect(
            screen.getByText(/This step requires an active/),
        ).toBeInTheDocument()
        expect(mockUseTrackstarLink).toHaveBeenCalledWith(
            expect.objectContaining({
                integrationAllowList: [
                    mockActionApp.auth_settings.integration_name,
                ],
            }),
        )
    })

    it('renders reconnect button when connection exists', () => {
        mockUseListTrackstarConnections.mockReturnValue({
            data: {
                sandbox: {
                    connection_id: 'sandbox_connection_id',
                    store_name: 'acme',
                    store_type: 'shopify',
                    account_id: 1,
                    integration_name: 'sandbox',
                    error: false,
                },
            },
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useListTrackstarConnections>)

        render(
            <StoreTrackstarProvider storeName="test-store" storeType="shopify">
                <ConnectTrackstarButton
                    app={mockApp as any}
                    actionApp={mockActionApp}
                />
            </StoreTrackstarProvider>,
        )

        expect(
            screen.getByText(`Reconnect ${mockApp.name}`),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                `Your ${mockApp.name} account is already connected. Click the button below to reconnect your account.`,
            ),
        ).toBeInTheDocument()

        expect(mockUseTrackstarLink).toHaveBeenCalledWith(
            expect.objectContaining({
                integrationAllowList: undefined,
            }),
        )
    })

    it('opens Trackstar link on button click', async () => {
        render(
            <StoreTrackstarProvider storeName="test-store" storeType="shopify">
                <ConnectTrackstarButton
                    app={mockApp as any}
                    actionApp={mockActionApp}
                />
            </StoreTrackstarProvider>,
        )

        fireEvent.click(screen.getByText(`Connect ${mockApp.name}`))

        await waitFor(() => {
            expect(mockTrackstarLink.open).toHaveBeenCalled()
        })
    })

    it('creates token on successful authentication', async () => {
        render(
            <StoreTrackstarProvider storeName="test-store" storeType="shopify">
                <ConnectTrackstarButton
                    app={mockApp as any}
                    actionApp={mockActionApp}
                />
            </StoreTrackstarProvider>,
        )

        // Extract onSuccess callback
        const onSuccess = mockUseTrackstarLink.mock.calls[0][0].onSuccess
        onSuccess('test-auth-code', 'sandbox')

        expect(mockCreateToken).toHaveBeenCalledWith([
            null,
            {
                auth_code: 'test-auth-code',
                store_name: 'test-store',
                store_type: 'shopify',
            },
        ])
    })

    it('fetches link token when getLinkToken is called', async () => {
        mockUseListTrackstarConnections.mockReturnValue({
            data: {
                sandbox: {
                    connection_id: 'sandbox_connection_id',
                    store_name: 'acme',
                    store_type: 'shopify',
                    account_id: 1,
                    integration_name: 'sandbox',
                    error: false,
                },
            },
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useListTrackstarConnections>)

        render(
            <StoreTrackstarProvider storeName="test-store" storeType="shopify">
                <ConnectTrackstarButton
                    app={mockApp as any}
                    actionApp={mockActionApp}
                />
            </StoreTrackstarProvider>,
        )

        // Extract getLinkToken function
        const getLinkToken = mockUseTrackstarLink.mock.calls[0][0].getLinkToken
        const result = await getLinkToken()

        expect(mockCreateLink).toHaveBeenCalledWith([
            {
                connection_id: 'sandbox_connection_id',
            },
        ])
        expect(result).toBe('test-link-token')
    })
})
