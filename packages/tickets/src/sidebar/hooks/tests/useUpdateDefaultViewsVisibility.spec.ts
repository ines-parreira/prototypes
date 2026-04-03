import { toast } from '@gorgias/axiom'
import type * as HelpdeskQueries from '@gorgias/helpdesk-queries'
import {
    queryKeys,
    useCreateAccountSetting,
    useUpdateAccountSetting,
} from '@gorgias/helpdesk-queries'

import { createTestQueryClient, renderHook } from '../../../tests/render.utils'
import { useUpdateDefaultViewsVisibility } from '../useUpdateDefaultViewsVisibility'

vi.mock('@gorgias/helpdesk-queries', async (importOriginal) => {
    const original = await importOriginal<typeof HelpdeskQueries>()
    return {
        ...original,
        useUpdateAccountSetting: vi.fn(),
        useCreateAccountSetting: vi.fn(),
    }
})

const mockUseUpdateAccountSetting = vi.mocked(useUpdateAccountSetting)
const mockUseCreateAccountSetting = vi.mocked(useCreateAccountSetting)

describe('useUpdateDefaultViewsVisibility', () => {
    const mockUpdate = vi.fn()
    const mockCreate = vi.fn()

    beforeEach(() => {
        mockUseUpdateAccountSetting.mockReturnValue({
            mutate: mockUpdate,
        } as any)
        mockUseCreateAccountSetting.mockReturnValue({
            mutate: mockCreate,
        } as any)
    })

    it('should call updateAccountSetting when id is provided', () => {
        const { result } = renderHook(() => useUpdateDefaultViewsVisibility())

        result.current({
            id: 42,
            data: { type: 'views-visibility', data: { hidden_views: [1] } },
        })

        expect(mockUpdate).toHaveBeenCalledWith({
            id: 42,
            data: { type: 'views-visibility', data: { hidden_views: [1] } },
        })
        expect(mockCreate).not.toHaveBeenCalled()
    })

    it('should call createAccountSetting when id is undefined', () => {
        const { result } = renderHook(() => useUpdateDefaultViewsVisibility())

        result.current({
            id: undefined,
            data: { type: 'views-visibility', data: { hidden_views: [3, 5] } },
        })

        expect(mockCreate).toHaveBeenCalledWith({
            data: { type: 'views-visibility', data: { hidden_views: [3, 5] } },
        })
        expect(mockUpdate).not.toHaveBeenCalled()
    })

    describe('createVisibility', () => {
        const queryKey = queryKeys.account.listAccountSettings({
            type: 'views-visibility',
        })
        const seedCacheData = {
            data: { data: [{ id: 1, type: 'other-setting', data: {} }] },
        }
        let capturedMutation: any

        beforeEach(() => {
            mockUseCreateAccountSetting.mockImplementation((options) => {
                capturedMutation = options!.mutation
                return { mutate: mockCreate } as any
            })
        })

        describe('onMutate', () => {
            it('should cancel pending queries for account settings', async () => {
                const queryClient = createTestQueryClient()
                const cancelSpy = vi.spyOn(queryClient, 'cancelQueries')
                renderHook(() => useUpdateDefaultViewsVisibility(), {
                    queryClient,
                })

                await capturedMutation.onMutate({
                    data: {
                        type: 'views-visibility',
                        data: { hidden_views: [] },
                    },
                })

                expect(cancelSpy).toHaveBeenCalledWith({ queryKey })
            })

            it('should optimistically add the new views-visibility setting to the cache', async () => {
                const queryClient = createTestQueryClient()
                queryClient.setQueryData(queryKey, seedCacheData)
                renderHook(() => useUpdateDefaultViewsVisibility(), {
                    queryClient,
                })

                await capturedMutation.onMutate({
                    data: {
                        type: 'views-visibility',
                        data: { hidden_views: [1, 2] },
                    },
                })

                const result =
                    queryClient.getQueryData<typeof seedCacheData>(queryKey)
                expect(result?.data.data).toContainEqual({
                    type: 'views-visibility',
                    data: { hidden_views: [1, 2] },
                })
            })

            it('should preserve existing settings when adding the new entry', async () => {
                const queryClient = createTestQueryClient()
                queryClient.setQueryData(queryKey, seedCacheData)
                renderHook(() => useUpdateDefaultViewsVisibility(), {
                    queryClient,
                })

                await capturedMutation.onMutate({
                    data: {
                        type: 'views-visibility',
                        data: { hidden_views: [] },
                    },
                })

                const result =
                    queryClient.getQueryData<typeof seedCacheData>(queryKey)
                expect(result?.data.data).toContainEqual({
                    id: 1,
                    type: 'other-setting',
                    data: {},
                })
            })

            it('should return previous data for rollback', async () => {
                const queryClient = createTestQueryClient()
                queryClient.setQueryData(queryKey, seedCacheData)
                renderHook(() => useUpdateDefaultViewsVisibility(), {
                    queryClient,
                })

                const context = await capturedMutation.onMutate({
                    data: {
                        type: 'views-visibility',
                        data: { hidden_views: [] },
                    },
                })

                expect(context.previousData).toEqual(seedCacheData)
            })

            it('should not modify cache when no existing data is present', async () => {
                const queryClient = createTestQueryClient()
                renderHook(() => useUpdateDefaultViewsVisibility(), {
                    queryClient,
                })

                await capturedMutation.onMutate({
                    data: {
                        type: 'views-visibility',
                        data: { hidden_views: [] },
                    },
                })

                expect(queryClient.getQueryData(queryKey)).toBeUndefined()
            })
        })

        describe('onError', () => {
            it('should rollback the cache to the previous data', () => {
                const queryClient = createTestQueryClient()
                renderHook(() => useUpdateDefaultViewsVisibility(), {
                    queryClient,
                })

                const previousData = { data: { data: [] } }
                capturedMutation.onError(
                    new Error('Network error'),
                    {},
                    { previousData },
                )

                expect(queryClient.getQueryData(queryKey)).toEqual(previousData)
            })

            it('should show an error toast', () => {
                const toastErrorSpy = vi
                    .spyOn(toast, 'error')
                    .mockImplementation(() => '' as any)
                renderHook(() => useUpdateDefaultViewsVisibility())

                capturedMutation.onError(new Error('Network error'), {}, {})

                expect(toastErrorSpy).toHaveBeenCalledWith(
                    'Failed to update views visibility',
                )
            })
        })

        describe('onSettled', () => {
            it('should invalidate the account settings query', () => {
                const queryClient = createTestQueryClient()
                const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
                renderHook(() => useUpdateDefaultViewsVisibility(), {
                    queryClient,
                })

                capturedMutation.onSettled()

                expect(invalidateSpy).toHaveBeenCalledWith({ queryKey })
            })
        })
    })
})
