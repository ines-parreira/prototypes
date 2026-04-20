import { assumeMock, renderHook } from '@repo/testing'

import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type { CustomField, CustomFieldValue } from 'custom-fields/types'
import useListTags from 'tags/useListTags'

import useConditionsData from '../useConditionsData'

jest.mock('tags/useListTags')
jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')

const useListTagsMock = assumeMock(useListTags)
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

type TagsQueryState = {
    data?: {
        pages: Array<{ data: { data: Array<{ id: number; name: string }> } }>
    }
    isFetching?: boolean
    isFetchingNextPage?: boolean
    hasNextPage?: boolean
    fetchNextPage?: jest.Mock
}

function setTagsQuery(state: TagsQueryState) {
    useListTagsMock.mockReturnValue({
        data: state.data,
        isFetching: state.isFetching ?? false,
        isFetchingNextPage: state.isFetchingNextPage ?? false,
        hasNextPage: state.hasNextPage ?? false,
        fetchNextPage: state.fetchNextPage ?? jest.fn(),
    } as unknown as ReturnType<typeof useListTags>)
}

function setCustomFieldsQuery({
    data,
    isLoading = false,
}: {
    data?: CustomField[]
    isLoading?: boolean
}) {
    useCustomFieldDefinitionsMock.mockReturnValue({
        data,
        isLoading,
    } as unknown as ReturnType<typeof useCustomFieldDefinitions>)
}

function makeField(overrides: Partial<CustomField> = {}): CustomField {
    return {
        id: 1,
        label: 'Field',
        definition: {
            data_type: 'text',
            input_settings: {
                input_type: 'dropdown',
                choices: ['a', 'b'],
            },
        },
        ...overrides,
    } as unknown as CustomField
}

describe('useConditionsData', () => {
    beforeEach(() => {
        setTagsQuery({})
        setCustomFieldsQuery({ data: [] })
    })

    describe('tags', () => {
        it('flattens pages into a single tags array', () => {
            setTagsQuery({
                data: {
                    pages: [
                        {
                            data: {
                                data: [
                                    { id: 1, name: 'urgent' },
                                    { id: 2, name: 'vip' },
                                ],
                            },
                        },
                        {
                            data: {
                                data: [{ id: 3, name: 'refund' }],
                            },
                        },
                    ],
                },
            })

            const { result } = renderHook(() => useConditionsData(''))

            expect(result.current.tags).toEqual([
                { id: 1, name: 'urgent' },
                { id: 2, name: 'vip' },
                { id: 3, name: 'refund' },
            ])
        })

        it('returns an empty array when the tags query has no data', () => {
            setTagsQuery({})

            const { result } = renderHook(() => useConditionsData(''))

            expect(result.current.tags).toEqual([])
        })

        it('passes the search query through to useListTags', () => {
            renderHook(() => useConditionsData('refund'))

            expect(useListTagsMock).toHaveBeenCalledWith({ search: 'refund' })
        })

        it('passes undefined to useListTags when the search query is empty', () => {
            renderHook(() => useConditionsData(''))

            expect(useListTagsMock).toHaveBeenCalledWith(undefined)
        })

        it('reports isLoadingTags as true only while the first page is loading', () => {
            setTagsQuery({ isFetching: true, isFetchingNextPage: false })
            const firstLoad = renderHook(() => useConditionsData(''))
            expect(firstLoad.result.current.isLoadingTags).toBe(true)

            setTagsQuery({ isFetching: true, isFetchingNextPage: true })
            const paginating = renderHook(() => useConditionsData(''))
            expect(paginating.result.current.isLoadingTags).toBe(false)
        })

        it('marks shouldLoadMoreTags true only when another page is available and not currently fetching', () => {
            setTagsQuery({ hasNextPage: true, isFetchingNextPage: false })
            const canLoad = renderHook(() => useConditionsData(''))
            expect(canLoad.result.current.shouldLoadMoreTags).toBe(true)

            setTagsQuery({ hasNextPage: true, isFetchingNextPage: true })
            const loading = renderHook(() => useConditionsData(''))
            expect(loading.result.current.shouldLoadMoreTags).toBe(false)

            setTagsQuery({ hasNextPage: false })
            const none = renderHook(() => useConditionsData(''))
            expect(none.result.current.shouldLoadMoreTags).toBe(false)
        })

        it('exposes fetchNextPage as onLoadMoreTags', () => {
            const fetchNextPage = jest.fn()
            setTagsQuery({ fetchNextPage })

            const { result } = renderHook(() => useConditionsData(''))
            result.current.onLoadMoreTags()

            expect(fetchNextPage).toHaveBeenCalledTimes(1)
        })
    })

    describe('dropdown fields', () => {
        it('returns only dropdown-input fields and drops non-dropdown ones', () => {
            setCustomFieldsQuery({
                data: [
                    makeField({ id: 1, label: 'Dropdown' }),
                    makeField({
                        id: 2,
                        label: 'Text input',
                        definition: {
                            data_type: 'text',
                            input_settings: {
                                input_type: 'input',
                            },
                        },
                    } as unknown as Partial<CustomField>),
                ],
            })

            const { result } = renderHook(() => useConditionsData(''))

            expect(result.current.dropdownFields).toHaveLength(1)
            expect(result.current.dropdownFields[0].id).toBe(1)
        })

        it('replaces boolean field choices with Yes and No', () => {
            setCustomFieldsQuery({
                data: [
                    makeField({
                        id: 5,
                        label: 'Is VIP',
                        definition: {
                            data_type: 'boolean',
                            input_settings: {
                                input_type: 'dropdown',
                                choices: [true, false],
                            },
                        },
                    } as unknown as Partial<CustomField>),
                ],
            })

            const { result } = renderHook(() => useConditionsData(''))

            const field = result.current.dropdownFields[0]
            expect(
                (field.definition.input_settings as { choices: unknown[] })
                    .choices,
            ).toEqual(['Yes', 'No'])
        })

        it('leaves non-boolean dropdown choices untouched', () => {
            setCustomFieldsQuery({
                data: [
                    makeField({
                        id: 1,
                        definition: {
                            data_type: 'text',
                            input_settings: {
                                input_type: 'dropdown',
                                choices: ['high', 'low'],
                            },
                        },
                    } as unknown as Partial<CustomField>),
                ],
            })

            const { result } = renderHook(() => useConditionsData(''))

            const field = result.current.dropdownFields[0]
            expect(
                (field.definition.input_settings as { choices: unknown[] })
                    .choices,
            ).toEqual(['high', 'low'])
        })

        it('reports isLoadingFields from the underlying query', () => {
            setCustomFieldsQuery({ data: [], isLoading: true })

            const { result } = renderHook(() => useConditionsData(''))

            expect(result.current.isLoadingFields).toBe(true)
        })

        it('returns an empty array when the fields query has no data', () => {
            setCustomFieldsQuery({ data: undefined })

            const { result } = renderHook(() => useConditionsData(''))

            expect(result.current.dropdownFields).toEqual([])
        })
    })

    describe('getFieldChoices', () => {
        it('returns an empty array for an unknown field id', () => {
            setCustomFieldsQuery({
                data: [makeField({ id: 1 })],
            })

            const { result } = renderHook(() => useConditionsData(''))

            expect(result.current.getFieldChoices(999)).toEqual([])
        })

        it('filters out non-string choices and returns the remaining strings', () => {
            setCustomFieldsQuery({
                data: [
                    makeField({
                        id: 1,
                        definition: {
                            data_type: 'text',
                            input_settings: {
                                input_type: 'dropdown',
                                choices: [
                                    'a',
                                    'b',
                                    1,
                                    true,
                                ] as CustomFieldValue[],
                            },
                        },
                    } as unknown as Partial<CustomField>),
                ],
            })

            const { result } = renderHook(() => useConditionsData(''))

            expect(result.current.getFieldChoices(1)).toEqual(['a', 'b'])
        })
    })

    describe('getFieldTree', () => {
        it('builds a tree of choices with one entry per top-level label', () => {
            setCustomFieldsQuery({
                data: [
                    makeField({
                        id: 1,
                        definition: {
                            data_type: 'text',
                            input_settings: {
                                input_type: 'dropdown',
                                choices: ['optA', 'optB', 'Parent::Child'],
                            },
                        },
                    } as unknown as Partial<CustomField>),
                ],
            })

            const { result } = renderHook(() => useConditionsData(''))
            const tree = result.current.getFieldTree(1)

            expect(tree.size).toBe(3)
            expect(tree.get('optA::leaf')?.value).toBe('optA')
            expect(tree.get('Parent::branch')?.value).toBeNull()
            expect(tree.get('Parent::branch')?.children.size).toBe(1)
        })

        it('returns an empty tree for an unknown field id', () => {
            setCustomFieldsQuery({ data: [makeField({ id: 1 })] })

            const { result } = renderHook(() => useConditionsData(''))
            const tree = result.current.getFieldTree(999)

            expect(tree.size).toBe(0)
        })
    })
})
