import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { act } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useGetSelfServiceConfiguration } from 'models/selfServiceConfiguration/queries'
import { updateSelfServiceConfigurationSSP } from 'models/selfServiceConfiguration/resources'
import { notify } from 'state/notifications/actions'

import useSelfServiceConfiguration from '../useSelfServiceConfiguration'
import { useSelfServiceConfigurationUpdate } from '../useSelfServiceConfigurationUpdate'
import useSelfServiceStoreIntegration from '../useSelfServiceStoreIntegration'

jest.mock('@tanstack/react-query')
jest.mock('hooks/useAppDispatch')
jest.mock('hooks/useAppSelector')
jest.mock('models/selfServiceConfiguration/queries')
jest.mock('models/selfServiceConfiguration/resources')
jest.mock('state/notifications/actions')
jest.mock('../useSelfServiceStoreIntegration')
jest.mock('../useSelfServiceConfigurationUpdate')

const useSelfServiceConfigurationUpdateMock =
    useSelfServiceConfigurationUpdate as jest.Mock
const useAppDispatchMock = useAppDispatch as jest.Mock
const useAppSelectorMock = useAppSelector as jest.Mock
const useGetSelfServiceConfigurationMock =
    useGetSelfServiceConfiguration as jest.Mock
const useSelfServiceStoreIntegrationMock =
    useSelfServiceStoreIntegration as jest.Mock
const updateSelfServiceConfigurationSSPMock =
    updateSelfServiceConfigurationSSP as jest.Mock
const notifyMock = notify as jest.Mock
const useQueryClientMock = assumeMock(useQueryClient)

const mockDispatch = jest.fn()
const mockNotify = jest.fn()

const shopType = 'exampleShopType'
const shopName = 'exampleShopName'

const mockConfigurationData = {
    deletedDatetime: null,
    someConfigField: 'someValue',
}

const mockStoreIntegration = {
    id: 'storeIntegration123',
}

describe('useSelfServiceConfiguration', () => {
    beforeEach(() => {
        const invalidateQueriesMock = jest.fn()
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
        useSelfServiceConfigurationUpdateMock.mockReturnValue(() => {
            jest.fn()
        })
        useAppDispatchMock.mockReturnValue(mockDispatch)
        useAppSelectorMock.mockReturnValue(true) // hasAutomate
        useGetSelfServiceConfigurationMock.mockReturnValue({
            data: mockConfigurationData,
            isLoading: false,
        })
        useSelfServiceStoreIntegrationMock.mockReturnValue(mockStoreIntegration)
        notifyMock.mockReturnValue(mockNotify)
        updateSelfServiceConfigurationSSPMock.mockResolvedValue({
            ...mockConfigurationData,
            deletedDatetime: null,
        })
    })

    it('should initialize with loading state', () => {
        useGetSelfServiceConfigurationMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() =>
            useSelfServiceConfiguration(shopType, shopName),
        )

        expect(result.current.isFetchPending).toBe(true)
        expect(result.current.selfServiceConfiguration).toBeUndefined()
    })

    it('should set selfServiceConfiguration when data is fetched', () => {
        const { result } = renderHook(() =>
            useSelfServiceConfiguration(shopType, shopName),
        )

        expect(result.current.isFetchPending).toBe(false)
        expect(result.current.selfServiceConfiguration).toEqual(
            mockConfigurationData,
        )
    })

    it('should update selfServiceConfiguration if deletedDatetime exists and hasAutomate is true', () => {
        useGetSelfServiceConfigurationMock.mockReturnValue({
            data: {
                ...mockConfigurationData,
                deletedDatetime: '2024-11-07T12:00:00Z',
            },
            isLoading: false,
        })

        act(() => {
            renderHook(() => useSelfServiceConfiguration(shopType, shopName))
        })

        expect(updateSelfServiceConfigurationSSP).toHaveBeenCalledWith(
            expect.objectContaining({
                deletedDatetime: null,
            }),
        )
    })

    it('should notify if storeIntegrationId is not available', () => {
        useSelfServiceStoreIntegrationMock.mockReturnValue(undefined)

        renderHook(() => useSelfServiceConfiguration(shopType, shopName))

        expect(mockDispatch).toHaveBeenCalledWith(
            notify({
                message: 'Failed to fetch store integration',
            }),
        )
    })
})
