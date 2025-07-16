import { act } from '@testing-library/react'

import { renderHook } from 'utils/testing/renderHook'

import { getSingleHelpCenterResponseFixture } from '../../../fixtures/getHelpCentersResponse.fixture'
import { useHelpCenterShopConnection } from '../useHelpCenterShopConnection'

jest.mock('models/storeMapping/queries', () => ({
    useCreateStoreMapping: jest.fn(),
    useUpdateStoreMapping: jest.fn(),
    useDeleteStoreMapping: jest.fn(),
    useListStoreMappings: jest.fn(),
}))

const mockUseCreateStoreMapping = require('models/storeMapping/queries')
    .useCreateStoreMapping as jest.MockedFunction<any>
const mockUseUpdateStoreMapping = require('models/storeMapping/queries')
    .useUpdateStoreMapping as jest.MockedFunction<any>
const mockUseDeleteStoreMapping = require('models/storeMapping/queries')
    .useDeleteStoreMapping as jest.MockedFunction<any>
const mockUseListStoreMappings = require('models/storeMapping/queries')
    .useListStoreMappings as jest.MockedFunction<any>

jest.mock('../../../hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

const mockUseHelpCenterApi = require('../../../hooks/useHelpCenterApi')
    .useHelpCenterApi as jest.MockedFunction<any>

jest.mock('../HelpCenterPreferencesSettings.helpers', () => ({
    integrationIsAlreadyMapped: jest.fn(),
    isConnectionGettingCreated: jest.fn(),
    isConnectionGettingUpdated: jest.fn(),
    isConnectionGettingDeleted: jest.fn(),
}))

const mockIntegrationIsAlreadyMapped =
    require('../HelpCenterPreferencesSettings.helpers')
        .integrationIsAlreadyMapped as jest.MockedFunction<any>
const mockIsConnectionGettingCreated =
    require('../HelpCenterPreferencesSettings.helpers')
        .isConnectionGettingCreated as jest.MockedFunction<any>
const mockIsConnectionGettingUpdated =
    require('../HelpCenterPreferencesSettings.helpers')
        .isConnectionGettingUpdated as jest.MockedFunction<any>
const mockIsConnectionGettingDeleted =
    require('../HelpCenterPreferencesSettings.helpers')
        .isConnectionGettingDeleted as jest.MockedFunction<any>

describe('useHelpCenterShopConnection', () => {
    const mockHelpCenter = {
        ...getSingleHelpCenterResponseFixture,
        integration_id: 123,
        shop_integration_id: 456,
    }

    const mockStoreMappings = [
        { store_id: 456, integration_id: 123 },
        { store_id: 789, integration_id: 124 },
    ]

    const mockClient = {
        updateHelpCenter: jest.fn(),
        getHelpCenter: jest.fn(),
    }

    const mockCreateMapping = jest.fn()
    const mockUpdateMapping = jest.fn()
    const mockDeleteMapping = jest.fn()
    const mockRefetch = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseHelpCenterApi.mockReturnValue({ client: mockClient })
        mockUseCreateStoreMapping.mockReturnValue({
            mutateAsync: mockCreateMapping,
        })
        mockUseUpdateStoreMapping.mockReturnValue({
            mutateAsync: mockUpdateMapping,
        })
        mockUseDeleteStoreMapping.mockReturnValue({
            mutateAsync: mockDeleteMapping,
        })
        mockUseListStoreMappings.mockReturnValue({
            data: mockStoreMappings,
            refetch: mockRefetch,
        })

        mockClient.updateHelpCenter.mockResolvedValue({ data: mockHelpCenter })
        mockClient.getHelpCenter.mockResolvedValue({ data: mockHelpCenter })
    })

    describe('handleShopConnectionChange', () => {
        it('should call updateHelpCenterDirect when help center has no integration_id', async () => {
            const helpCenterWithoutIntegration = {
                ...mockHelpCenter,
                integration_id: null,
            }
            const { result } = renderHook(() =>
                useHelpCenterShopConnection(helpCenterWithoutIntegration),
            )

            const connectedShop = {
                shopName: 'Test Shop',
                shopIntegrationId: 789,
                selfServiceDeactivated: false,
            }

            await act(async () => {
                await result.current.handleShopConnectionChange(connectedShop)
            })

            expect(mockClient.updateHelpCenter).toHaveBeenCalledWith(
                { help_center_id: helpCenterWithoutIntegration.id },
                {
                    shop_name: connectedShop.shopName,
                    shop_integration_id: connectedShop.shopIntegrationId,
                    self_service_deactivated:
                        connectedShop.selfServiceDeactivated,
                },
            )
        })

        describe('connection creation scenario', () => {
            beforeEach(() => {
                mockIsConnectionGettingCreated.mockReturnValue(true)
                mockIsConnectionGettingUpdated.mockReturnValue(false)
                mockIsConnectionGettingDeleted.mockReturnValue(false)
            })

            it('should create mapping when connection is getting created', async () => {
                const { result } = renderHook(() =>
                    useHelpCenterShopConnection(mockHelpCenter),
                )

                const connectedShop = {
                    shopName: 'Test Shop',
                    shopIntegrationId: 789,
                    selfServiceDeactivated: false,
                }

                await act(async () => {
                    await result.current.handleShopConnectionChange(
                        connectedShop,
                    )
                })

                expect(mockCreateMapping).toHaveBeenCalledWith([
                    {
                        store_id: connectedShop.shopIntegrationId,
                        integration_id: mockHelpCenter.integration_id,
                    },
                ])
                expect(mockRefetch).toHaveBeenCalled()
                expect(mockClient.getHelpCenter).toHaveBeenCalledWith({
                    help_center_id: mockHelpCenter.id,
                })
            })
        })

        describe('connection update scenario', () => {
            beforeEach(() => {
                mockIsConnectionGettingCreated.mockReturnValue(false)
                mockIsConnectionGettingUpdated.mockReturnValue(true)
                mockIsConnectionGettingDeleted.mockReturnValue(false)
            })

            it('should update mapping when connection is getting updated and already mapped', async () => {
                mockIntegrationIsAlreadyMapped.mockReturnValue(true)
                const { result } = renderHook(() =>
                    useHelpCenterShopConnection(mockHelpCenter),
                )

                const connectedShop = {
                    shopName: 'Test Shop',
                    shopIntegrationId: 789,
                    selfServiceDeactivated: false,
                }

                await act(async () => {
                    await result.current.handleShopConnectionChange(
                        connectedShop,
                    )
                })

                expect(mockUpdateMapping).toHaveBeenCalledWith([
                    {
                        store_id: connectedShop.shopIntegrationId,
                        integration_id: mockHelpCenter.integration_id,
                    },
                    mockHelpCenter.integration_id,
                ])
            })

            it('should create mapping when connection is getting updated but not already mapped', async () => {
                mockIntegrationIsAlreadyMapped.mockReturnValue(false)
                const { result } = renderHook(() =>
                    useHelpCenterShopConnection(mockHelpCenter),
                )

                const connectedShop = {
                    shopName: 'Test Shop',
                    shopIntegrationId: 789,
                    selfServiceDeactivated: false,
                }

                await act(async () => {
                    await result.current.handleShopConnectionChange(
                        connectedShop,
                    )
                })

                expect(mockCreateMapping).toHaveBeenCalledWith([
                    {
                        store_id: connectedShop.shopIntegrationId,
                        integration_id: mockHelpCenter.integration_id,
                    },
                ])
                expect(mockRefetch).toHaveBeenCalled()
            })
        })

        describe('connection deletion scenario', () => {
            beforeEach(() => {
                mockIsConnectionGettingCreated.mockReturnValue(false)
                mockIsConnectionGettingUpdated.mockReturnValue(false)
                mockIsConnectionGettingDeleted.mockReturnValue(true)
            })

            it('should delete mapping when connection is getting deleted and already mapped', async () => {
                mockIntegrationIsAlreadyMapped.mockReturnValue(true)
                const { result } = renderHook(() =>
                    useHelpCenterShopConnection(mockHelpCenter),
                )

                const connectedShop = {
                    shopName: 'Test Shop',
                    shopIntegrationId: null,
                    selfServiceDeactivated: false,
                }

                await act(async () => {
                    await result.current.handleShopConnectionChange(
                        connectedShop,
                    )
                })

                expect(mockDeleteMapping).toHaveBeenCalledWith([
                    mockHelpCenter.integration_id,
                ])
                expect(mockRefetch).toHaveBeenCalled()
            })

            it('should call updateHelpCenterDirect when connection is getting deleted but not already mapped', async () => {
                mockIntegrationIsAlreadyMapped.mockReturnValue(false)
                const { result } = renderHook(() =>
                    useHelpCenterShopConnection(mockHelpCenter),
                )

                const connectedShop = {
                    shopName: 'Test Shop',
                    shopIntegrationId: null,
                    selfServiceDeactivated: false,
                }

                await act(async () => {
                    await result.current.handleShopConnectionChange(
                        connectedShop,
                    )
                })

                expect(mockClient.updateHelpCenter).toHaveBeenCalledWith(
                    { help_center_id: mockHelpCenter.id },
                    {
                        shop_name: connectedShop.shopName,
                        shop_integration_id: connectedShop.shopIntegrationId,
                        self_service_deactivated:
                            connectedShop.selfServiceDeactivated,
                    },
                )
            })
        })
    })

    it('should handle client being null in multistore scenario', async () => {
        mockUseHelpCenterApi.mockReturnValue({ client: null })
        const { result } = renderHook(() =>
            useHelpCenterShopConnection(mockHelpCenter),
        )

        const connectedShop = {
            shopName: 'Test Shop',
            shopIntegrationId: 789,
            selfServiceDeactivated: false,
        }

        let returnValue
        await act(async () => {
            returnValue =
                await result.current.handleShopConnectionChange(connectedShop)
        })

        expect(returnValue).toBeNull()
    })
})
