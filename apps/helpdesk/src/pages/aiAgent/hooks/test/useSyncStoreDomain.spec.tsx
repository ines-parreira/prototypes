import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    ShopifyIntegration,
    ShopifyIntegrationMeta,
} from 'models/integration/types'
import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { getIngestionLogFixture } from 'pages/aiAgent/fixtures/ingestionLog.fixture'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { RootState } from 'state/types'

import { useGetStoreDomainIngestionLog } from '../useGetStoreDomainIngestionLog'
import { useIngestionLogMutation } from '../useIngestionLogMutation'
import { useSyncStoreDomain } from '../useSyncStoreDomain'

const mockedDispatch = jest.fn()
const mockedShopName = 'test-shop'
const mockedStoreDomainIngestionLog = getIngestionLogFixture({
    domain: `${mockedShopName}.myshopify.com`,
    url: `https://${mockedShopName}.myshopify.com`,
})
const mockedStartIngestion = jest.fn()
const mockedOnStatusChange = jest.fn()

jest.mock('state/notifications/actions')

jest.mock('hooks/useAppDispatch')
const mockUseAppDispatch = assumeMock(useAppDispatch)

jest.mock('pages/aiAgent/hooks/useGetStoreDomainIngestionLog')
const mockUseGetStoreDomainIngestionLog = assumeMock(
    useGetStoreDomainIngestionLog,
)

jest.mock('pages/aiAgent/hooks/useIngestionLogMutation')
const mockUseIngestionLogMutation = assumeMock(useIngestionLogMutation)

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                type: IntegrationType.Shopify,
                meta: {
                    shop_name: mockedShopName,
                    shop_domain: `${mockedShopName}.myshopify.com`,
                } as Omit<ShopifyIntegrationMeta, 'oauth'>,
            } as ShopifyIntegration,
        ],
    }),
} as RootState

const mockStore = configureMockStore([thunk])(defaultState)

describe('useSyncStoreDomain', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseAppDispatch.mockReturnValue(mockedDispatch)
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            storeDomainIngestionLog: mockedStoreDomainIngestionLog,
            status: IngestionLogStatus.Pending,
            isGetIngestionLogsLoading: false,
        })
        mockUseIngestionLogMutation.mockReturnValue({
            startIngestion: mockedStartIngestion,
        })
    })

    it('returns the expected values', () => {
        const { result } = renderHook(
            () =>
                useSyncStoreDomain({
                    helpCenterId: 1,
                    shopName: 'test-shop',
                    onStatusChange: mockedOnStatusChange,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )

        expect(result.current.storeDomain).toEqual(
            `${mockedShopName}.myshopify.com`,
        )
        expect(result.current.storeUrl).toEqual(
            `https://${mockedShopName}.myshopify.com`,
        )
        expect(result.current.storeDomainIngestionLog).toEqual(
            mockedStoreDomainIngestionLog,
        )
        expect(result.current.isFetchLoading).toBe(false)
        expect(result.current.syncTriggered).toBe(false)
        expect(result.current.handleTriggerSync).toBeInstanceOf(Function)
        expect(result.current.handleOnSync).toBeInstanceOf(Function)
        expect(result.current.handleOnCancel).toBeInstanceOf(Function)
    })

    it('should call startIngestion when handleOnSync is called', () => {
        const { result } = renderHook(
            () =>
                useSyncStoreDomain({
                    helpCenterId: 1,
                    shopName: 'test-shop',
                    onStatusChange: mockedOnStatusChange,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )

        result.current.handleOnSync()

        expect(mockedStartIngestion).toHaveBeenCalledWith({
            url: `https://${mockedShopName}.myshopify.com`,
            type: 'domain',
        })
    })

    it('shoudl set syncTriggered to false when handleOnCancel is called', () => {
        const { result } = renderHook(
            () =>
                useSyncStoreDomain({
                    helpCenterId: 1,
                    shopName: 'test-shop',
                    onStatusChange: mockedOnStatusChange,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )

        result.current.handleOnCancel()

        expect(result.current.syncTriggered).toBe(false)
    })

    it('should set syncTriggered to true when handleTriggerSync is called and storeDomainIngestionLog is exist', async () => {
        const { result } = renderHook(
            () =>
                useSyncStoreDomain({
                    helpCenterId: 1,
                    shopName: 'test-shop',
                    onStatusChange: mockedOnStatusChange,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )

        result.current.handleTriggerSync()

        await waitFor(() => {
            expect(result.current.syncTriggered).toBe(true)
        })
    })

    it('should call handleOnSync when handleTriggerSync is called and storeDomainIngestionLog is not exist', () => {
        mockUseGetStoreDomainIngestionLog.mockReturnValue({
            storeDomainIngestionLog: undefined,
            status: undefined,
            isGetIngestionLogsLoading: false,
        })

        const { result } = renderHook(
            () =>
                useSyncStoreDomain({
                    helpCenterId: 1,
                    shopName: 'test-shop',
                    onStatusChange: mockedOnStatusChange,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )

        result.current.handleTriggerSync()

        expect(mockedStartIngestion).toHaveBeenCalledWith({
            url: `https://${mockedShopName}.myshopify.com`,
            type: 'domain',
        })
    })

    it('should set syncTriggered to false when handleOnSync is called', () => {
        const { result } = renderHook(
            () =>
                useSyncStoreDomain({
                    helpCenterId: 1,
                    shopName: 'test-shop',
                    onStatusChange: mockedOnStatusChange,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )

        result.current.handleOnSync()

        expect(result.current.syncTriggered).toBe(false)
    })

    it('should notify error when startIngestion fails', () => {
        mockedStartIngestion.mockImplementation(() => {
            throw new Error('Error during Store Domain sync')
        })

        const { result } = renderHook(
            () =>
                useSyncStoreDomain({
                    helpCenterId: 1,
                    shopName: 'test-shop',
                    onStatusChange: mockedOnStatusChange,
                }),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore}>{children}</Provider>
                ),
            },
        )

        result.current.handleOnSync()

        expect(mockUseAppDispatch).toHaveBeenCalled()
        expect(notify).toHaveBeenCalledWith({
            status: NotificationStatus.Error,
            message:
                'Error during Store Domain sync. Please try again later or contact support',
        })
    })
})
