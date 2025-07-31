import { renderHook } from '@repo/testing'

import {
    useCreateStoreMapping,
    useUpdateStoreMapping,
} from 'models/storeMapping/queries'

import { Components } from '../../../../../../../rest_api/help_center_api/client.generated'
import { useStoreToChannelMappings } from '../useStoreToChannelMappings'

import HelpCenterDto = Components.Schemas.HelpCenterDto

jest.mock('models/storeMapping/queries', () => ({
    useCreateStoreMapping: jest.fn(),
    useUpdateStoreMapping: jest.fn(),
}))

const useCreateStoreMappingMock = useCreateStoreMapping as jest.Mock
const useUpdateStoreMappingMock = useUpdateStoreMapping as jest.Mock

describe('useStoreToChannelMappings', () => {
    const mockCreateMapping = jest.fn()
    const mockUpdateMapping = jest.fn()
    const storeId = 123
    const helpCenterIntegrationId = 456
    const mockHelpCenter = {
        shop_integration_id: storeId,
        integration_id: helpCenterIntegrationId,
    } as HelpCenterDto

    beforeEach(() => {
        jest.clearAllMocks()
        useCreateStoreMappingMock.mockReturnValue({
            mutateAsync: mockCreateMapping,
        })
        useUpdateStoreMappingMock.mockReturnValue({
            mutateAsync: mockUpdateMapping,
        })
    })

    it('should create mapping when isUpdate is false', async () => {
        const { result } = renderHook(() => useStoreToChannelMappings())

        await result.current.handleStoreToChannelMapping(false, mockHelpCenter)

        expect(mockCreateMapping).toHaveBeenCalledWith([
            {
                store_id: storeId,
                integration_id: helpCenterIntegrationId,
            },
        ])
        expect(mockUpdateMapping).not.toHaveBeenCalled()
    })

    it('should update mapping when isUpdate is true', async () => {
        const { result } = renderHook(() => useStoreToChannelMappings())

        await result.current.handleStoreToChannelMapping(true, mockHelpCenter)

        expect(mockUpdateMapping).toHaveBeenCalledWith([
            {
                store_id: storeId,
                integration_id: helpCenterIntegrationId,
            },
            helpCenterIntegrationId,
        ])
        expect(mockCreateMapping).not.toHaveBeenCalled()
    })

    it('should not call any mapping function when storeId is null', async () => {
        const { result } = renderHook(() => useStoreToChannelMappings())

        await result.current.handleStoreToChannelMapping(false, {
            ...mockHelpCenter,
            shop_integration_id: null,
        })

        expect(mockCreateMapping).not.toHaveBeenCalled()
        expect(mockUpdateMapping).not.toHaveBeenCalled()
    })

    it('should not call any mapping function when helpCenterIntegrationId is null', async () => {
        const { result } = renderHook(() => useStoreToChannelMappings())

        await result.current.handleStoreToChannelMapping(false, {
            ...mockHelpCenter,
            integration_id: null,
        })

        expect(mockCreateMapping).not.toHaveBeenCalled()
        expect(mockUpdateMapping).not.toHaveBeenCalled()
    })

    it('should not call any mapping function when helpCenter is null', async () => {
        const { result } = renderHook(() => useStoreToChannelMappings())

        await result.current.handleStoreToChannelMapping(false, null)

        expect(mockCreateMapping).not.toHaveBeenCalled()
        expect(mockUpdateMapping).not.toHaveBeenCalled()
    })

    it('should not call any mapping function when helpCenter is undefined', async () => {
        const { result } = renderHook(() => useStoreToChannelMappings())

        await result.current.handleStoreToChannelMapping(false, undefined)
        expect(mockCreateMapping).not.toHaveBeenCalled()
        expect(mockUpdateMapping).not.toHaveBeenCalled()
    })
})
