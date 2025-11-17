import { assumeMock, renderHook } from '@repo/testing'
import type { UseQueryResult } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import {
    useGetEmail,
    useGetEmailIntegrationsWithStoreName,
} from 'hooks/email/useGetEmail'
import useAppSelector from 'hooks/useAppSelector'
import { useListStoreMappings } from 'models/storeMapping/queries'

jest.mock('hooks/useAppSelector')
jest.mock('models/storeMapping/queries')
jest.mock('state/integrations/selectors')

const useAppSelectorMock = assumeMock(useAppSelector)
const useListStoreMappingsMock = assumeMock(useListStoreMappings)

describe('useGetEmail', () => {
    const mockEmailIntegrations = [{ id: 1 }, { id: 2 }, { id: 3 }]

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(mockEmailIntegrations)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return email integrations without name', () => {
        const { result } = renderHook(() => useGetEmail())
        expect(result.current).toEqual({
            emailIntegrationsWithoutName: [
                { id: 1, email_id: 1, channel: 'email' },
                { id: 2, email_id: 2, channel: 'email' },
                { id: 3, email_id: 3, channel: 'email' },
            ],
        })
    })
})

describe('useGetEmailIntegrationsWithStoreName', () => {
    const mockStoreMappings = [
        { id: 1, store_id: 101, channel: 'email', integration_id: 101 },
        { id: 2, store_id: 102, channel: 'email', integration_id: 102 },
        { id: 3, store_id: 103, channel: 'email', integration_id: 103 },
    ]
    const mockInstalledIntegrations = [
        { id: 101, name: 'Store 1' },
        { id: 102, name: 'Store 2' },
        { id: 103, name: 'Store 3' },
    ]

    beforeEach(() => {
        useListStoreMappingsMock.mockReturnValue({
            data: mockStoreMappings,
        } as UseQueryResult<unknown, AxiosError<unknown, any>>)
        useAppSelectorMock.mockReturnValue(mockInstalledIntegrations)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return email integrations with store name for the given shop name', () => {
        const integrations = [
            { id: 1, email_id: 101, channel: 'email' },
            { id: 2, email_id: 102, channel: 'email' },
            { id: 3, email_id: 3, channel: 'email' },
        ]
        const { result } = renderHook(() =>
            useGetEmailIntegrationsWithStoreName({
                integrations,
                shopName: 'Store 1',
            }),
        )
        expect(result.current).toEqual([
            {
                id: 1,
                storeName: 'Store 1',
                channel: 'email',
            },
        ])
    })

    it('should return an empty array if no integrations match the shop name', () => {
        const integrations = [
            { id: 1, email_id: 1, channel: 'email' },
            { id: 2, email_id: 2, channel: 'email' },
            { id: 3, email_id: 3, channel: 'email' },
        ]
        const { result } = renderHook(() =>
            useGetEmailIntegrationsWithStoreName({
                integrations,
                shopName: 'Store 4',
            }),
        )
        expect(result.current).toEqual([])
    })
})
