import { assumeMock, renderHook } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { screen } from '@testing-library/react'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import {
    storeWorkflowsConfigurationDefinitionKeys,
    useUpsertStoreWorkflowsConfiguration,
    workflowsConfigurationDefinitionKeys,
} from 'models/workflows/queries'

import { handleError } from '../errorHandler'
import useUpsertAction from '../useUpsertAction'
import { actionConfigurationFixture } from './actions.fixtures'

jest.mock('models/workflows/queries', () => ({
    ...jest.requireActual('models/workflows/queries'),
    useUpsertStoreWorkflowsConfiguration: jest.fn(),
}))
const useUpsertWorkflowConfigurationMock = assumeMock(
    useUpsertStoreWorkflowsConfiguration,
)

jest.mock('../errorHandler')

describe('useUpsertAction', () => {
    const internalId = 1
    const shopName = 'shop-name'
    const shopType = 'shopify' as const
    const listQueryKey = storeWorkflowsConfigurationDefinitionKeys.list({
        storeName: shopName,
        storeType: shopType,
    })

    beforeEach(() => {
        useUpsertWorkflowConfigurationMock.mockClear()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('creates store action configuration', async () => {
        renderHook(() => useUpsertAction('create', shopName, shopType))

        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(actionConfigurationFixture),
            [internalId, actionConfigurationFixture],
            undefined,
        )

        expect(
            await screen.findByRole('status', {
                name: 'Successfully created Action',
            }),
        ).toBeInTheDocument()
    })

    it('updates store action configuration', async () => {
        renderHook(() => useUpsertAction('update', shopName, shopType))

        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(actionConfigurationFixture),
            [internalId, actionConfigurationFixture],
            undefined,
        )

        expect(
            await screen.findByRole('status', {
                name: 'Successfully updated Action',
            }),
        ).toBeInTheDocument()
    })

    it('should call handleError on error', () => {
        renderHook(() => useUpsertAction('update', shopName, shopType))

        const errorResponseBody = {
            message: 'error message',
        }
        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onError!(
            errorResponseBody,
            [0],
            undefined,
        )

        expect(handleError).toHaveBeenNthCalledWith(
            1,
            errorResponseBody,
            'Fail to update Action. Please try again later.',
        )
    })

    it('should call handleError with create message on error during create', () => {
        renderHook(() => useUpsertAction('create', shopName, shopType))

        const errorResponseBody = { message: 'something failed' }
        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onError!(
            errorResponseBody,
            [0],
            undefined,
        )

        expect(handleError).toHaveBeenLastCalledWith(
            errorResponseBody,
            'Fail to create Action. Please try again later.',
        )
    })

    it('cancels and snapshots existing list queries during onMutate for create without optimistic update', async () => {
        const cancelQueriesSpy = jest
            .spyOn(QueryClient.prototype, 'cancelQueries')
            .mockResolvedValue()
        const previousSnapshot: ReadonlyArray<[readonly unknown[], unknown]> = [
            [listQueryKey, [actionConfigurationFixture]],
        ]
        const getQueriesDataSpy = jest
            .spyOn(QueryClient.prototype, 'getQueriesData')
            .mockReturnValue(previousSnapshot as never)
        const setQueriesDataSpy = jest.spyOn(
            QueryClient.prototype,
            'setQueriesData',
        )

        renderHook(() => useUpsertAction('create', shopName, shopType))

        const context = await useUpsertWorkflowConfigurationMock.mock
            .calls[0][0]?.onMutate!([
            {
                internal_id: internalId.toString(),
                store_name: shopName,
                store_type: shopType,
            },
            actionConfigurationFixture,
        ])

        expect(cancelQueriesSpy).toHaveBeenCalledWith({
            queryKey: listQueryKey,
        })
        expect(getQueriesDataSpy).toHaveBeenCalledWith({
            queryKey: listQueryKey,
        })
        expect(setQueriesDataSpy).not.toHaveBeenCalled()
        expect(context).toEqual({
            previousStoreWorkflowConfigurations: previousSnapshot,
        })
    })

    it('optimistically replaces the matching action in list queries during onMutate for update', async () => {
        jest.spyOn(QueryClient.prototype, 'cancelQueries').mockResolvedValue()
        jest.spyOn(QueryClient.prototype, 'getQueriesData').mockReturnValue(
            [] as never,
        )
        const setQueriesDataSpy = jest
            .spyOn(QueryClient.prototype, 'setQueriesData')
            .mockReturnValue(undefined as never)

        renderHook(() => useUpsertAction('update', shopName, shopType))

        const updatedAction = {
            ...actionConfigurationFixture,
            name: 'Optimistic name',
        }
        await useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onMutate!([
            {
                internal_id: actionConfigurationFixture.internal_id,
                store_name: shopName,
                store_type: shopType,
            },
            updatedAction,
        ])

        expect(setQueriesDataSpy).toHaveBeenCalledTimes(1)
        const [filter, updater] = setQueriesDataSpy.mock.calls[0]
        expect(filter).toEqual({ queryKey: listQueryKey })

        const previousList = [
            { ...actionConfigurationFixture, name: 'Old name' },
            { ...actionConfigurationFixture, id: 'other-id', name: 'Other' },
        ]
        const next = (updater as (prev: unknown) => unknown)(previousList)

        expect(next).toEqual([
            updatedAction,
            { ...actionConfigurationFixture, id: 'other-id', name: 'Other' },
        ])

        const undefinedNext = (updater as (prev: unknown) => unknown)(undefined)
        expect(undefinedNext).toBeUndefined()
    })

    it('does not optimistically update list queries when update is called without data', async () => {
        jest.spyOn(QueryClient.prototype, 'cancelQueries').mockResolvedValue()
        jest.spyOn(QueryClient.prototype, 'getQueriesData').mockReturnValue(
            [] as never,
        )
        const setQueriesDataSpy = jest.spyOn(
            QueryClient.prototype,
            'setQueriesData',
        )

        renderHook(() => useUpsertAction('update', shopName, shopType))

        await useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onMutate!([
            {
                internal_id: actionConfigurationFixture.internal_id,
                store_name: shopName,
                store_type: shopType,
            },
            undefined as never,
        ])

        expect(setQueriesDataSpy).not.toHaveBeenCalled()
    })

    it('appends the new action to the list and seeds the detail cache on successful create', async () => {
        const setQueryDataSpy = jest
            .spyOn(QueryClient.prototype, 'setQueryData')
            .mockReturnValue(undefined as never)
        const setQueriesDataSpy = jest
            .spyOn(QueryClient.prototype, 'setQueriesData')
            .mockReturnValue(undefined as never)

        renderHook(() => useUpsertAction('create', shopName, shopType))

        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(actionConfigurationFixture),
            [internalId, actionConfigurationFixture],
            undefined,
        )

        expect(setQueryDataSpy).toHaveBeenCalledWith(
            workflowsConfigurationDefinitionKeys.get(
                actionConfigurationFixture.id,
            ),
            actionConfigurationFixture,
        )
        expect(setQueriesDataSpy).toHaveBeenCalledTimes(1)
        const [filter, updater] = setQueriesDataSpy.mock.calls[0]
        expect(filter).toEqual({ queryKey: listQueryKey })

        const existing = [
            { ...actionConfigurationFixture, id: 'existing', name: 'Existing' },
        ]
        const next = (updater as (prev: unknown) => unknown)(existing)

        expect(next).toEqual([...existing, actionConfigurationFixture])
        expect(
            (updater as (prev: unknown) => unknown)(undefined),
        ).toBeUndefined()
    })

    it('replaces the existing action in the list and updates the detail cache on successful update', async () => {
        const setQueryDataSpy = jest
            .spyOn(QueryClient.prototype, 'setQueryData')
            .mockReturnValue(undefined as never)
        const setQueriesDataSpy = jest
            .spyOn(QueryClient.prototype, 'setQueriesData')
            .mockReturnValue(undefined as never)

        renderHook(() => useUpsertAction('update', shopName, shopType))

        const updated = {
            ...actionConfigurationFixture,
            name: 'Renamed action',
        }
        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onSuccess!(
            axiosSuccessResponse(updated),
            [internalId, updated],
            undefined,
        )

        expect(setQueryDataSpy).toHaveBeenCalledWith(
            workflowsConfigurationDefinitionKeys.get(updated.id),
            updated,
        )
        expect(setQueriesDataSpy).toHaveBeenCalledTimes(1)
        const [, updater] = setQueriesDataSpy.mock.calls[0]
        const previousList = [
            { ...actionConfigurationFixture, name: 'Old name' },
            { ...actionConfigurationFixture, id: 'other', name: 'Other' },
        ]

        const next = (updater as (prev: unknown) => unknown)(previousList)
        expect(next).toEqual([
            updated,
            { ...actionConfigurationFixture, id: 'other', name: 'Other' },
        ])
        expect(
            (updater as (prev: unknown) => unknown)(undefined),
        ).toBeUndefined()
    })

    it('restores previously cached list queries when onError receives a rollback context', () => {
        const setQueryDataSpy = jest
            .spyOn(QueryClient.prototype, 'setQueryData')
            .mockReturnValue(undefined as never)

        renderHook(() => useUpsertAction('update', shopName, shopType))

        const previousStoreWorkflowConfigurations = [
            [listQueryKey, [actionConfigurationFixture]],
            [
                [...listQueryKey, 'other'],
                [{ ...actionConfigurationFixture, id: 'other' }],
            ],
        ] as Array<[readonly unknown[], unknown]>

        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onError!(
            { message: 'boom' },
            [0],
            { previousStoreWorkflowConfigurations },
        )

        expect(setQueryDataSpy).toHaveBeenCalledTimes(
            previousStoreWorkflowConfigurations.length,
        )
        for (const [key, value] of previousStoreWorkflowConfigurations) {
            expect(setQueryDataSpy).toHaveBeenCalledWith(key, value)
        }
    })

    it('does not attempt to roll back when no rollback context is provided', () => {
        const setQueryDataSpy = jest.spyOn(
            QueryClient.prototype,
            'setQueryData',
        )

        renderHook(() => useUpsertAction('update', shopName, shopType))

        useUpsertWorkflowConfigurationMock.mock.calls[0][0]?.onError!(
            { message: 'boom' },
            [0],
            undefined,
        )

        expect(setQueryDataSpy).not.toHaveBeenCalled()
    })
})
