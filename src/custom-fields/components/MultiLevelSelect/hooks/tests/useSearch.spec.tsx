import { act, renderHook } from '@testing-library/react-hooks/dom'

import { CHOICE_VALUES_SYMBOL } from '../../constants'
import { ChoicesTree } from '../../types'
import { useSearch } from '../useSearch'

describe('useSearch', () => {
    it('should return the correct state when disabled', () => {
        const disabledResults = {
            isSearching: false,
            search: '',
            searchResults: [],
            setSearch: expect.any(Function),
            valueIsInSearchResults: false,
        }

        const { result } = renderHook(() =>
            useSearch({
                choices: {
                    [CHOICE_VALUES_SYMBOL]: new Set(['foo', 'bar', 'baz']),
                },
                dropdownValue: undefined,
                isDisabled: true,
            }),
        )
        expect(result.current).toEqual(disabledResults)
        act(() => {
            result.current.setSearch('foo')
        })

        expect(result.current).toEqual({ ...disabledResults, search: 'foo' })
    })

    describe('search', () => {
        it('should correctly set isSearching to true when search is not empty', () => {
            const { result } = renderHook(() =>
                useSearch({
                    choices: {
                        [CHOICE_VALUES_SYMBOL]: new Set(['foo', 'bar', 'baz']),
                    },
                    dropdownValue: undefined,
                    isDisabled: false,
                }),
            )
            expect(result.current.isSearching).toEqual(false)
            act(() => {
                result.current.setSearch('foo')
            })
            expect(result.current.isSearching).toEqual(true)
        })

        it('should correctly search amongst flat choices of all types', () => {
            const { result, rerender } = renderHook(
                (props) => useSearch(props),
                {
                    initialProps: {
                        choices: {
                            [CHOICE_VALUES_SYMBOL]: new Set([
                                'Foo',
                                'bar',
                                'baz',
                            ]),
                        } as ChoicesTree,
                        dropdownValue: undefined,
                        isDisabled: false,
                    },
                },
            )
            act(() => {
                result.current.setSearch('foo ')
            })
            expect(result.current.searchResults).toEqual([
                {
                    label: 'Foo',
                    value: 'Foo',
                    path: '',
                },
            ])

            rerender({
                choices: {
                    [CHOICE_VALUES_SYMBOL]: new Set([10, 100, 4]),
                    bar: {
                        [CHOICE_VALUES_SYMBOL]: new Set([11, 101, 5]),
                    },
                },
                dropdownValue: undefined,
                isDisabled: false,
            })
            act(() => {
                result.current.setSearch('bar')
            })
            expect(result.current.searchResults).toEqual([])

            rerender({
                choices: {
                    [CHOICE_VALUES_SYMBOL]: new Set([true, false]),
                    bar: {
                        [CHOICE_VALUES_SYMBOL]: new Set([true, false]),
                    },
                },
                dropdownValue: undefined,
                isDisabled: false,
            })
            act(() => {
                result.current.setSearch('bar')
            })
            expect(result.current.searchResults).toEqual([])
        })

        it('should correctly search amongst nested choices and categories of string types', () => {
            const { result } = renderHook(() =>
                useSearch({
                    choices: {
                        [CHOICE_VALUES_SYMBOL]: new Set(['foo', 'bar', 'baz']),
                        categoryBar: {
                            [CHOICE_VALUES_SYMBOL]: new Set([
                                'foo1',
                                'bar1',
                                'baz1',
                            ]),
                        },
                        categoryFoo: {
                            [CHOICE_VALUES_SYMBOL]: new Set(),
                            barista: {
                                [CHOICE_VALUES_SYMBOL]: new Set([
                                    'count me in',
                                    'don’t count me off',
                                ]),
                            },
                            fooista: {
                                [CHOICE_VALUES_SYMBOL]: new Set([
                                    'bar in',
                                    'foo off',
                                ]),
                            },
                        },
                    },
                    dropdownValue: undefined,
                    isDisabled: false,
                }),
            )
            act(() => {
                result.current.setSearch('bar')
            })
            expect(result.current.searchResults).toEqual([
                {
                    label: 'bar',
                    path: '',
                    value: 'bar',
                },
                {
                    label: 'foo1',
                    path: 'categoryBar',
                    value: 'categoryBar::foo1',
                },
                {
                    label: 'bar1',
                    path: 'categoryBar',
                    value: 'categoryBar::bar1',
                },
                {
                    label: 'baz1',
                    path: 'categoryBar',
                    value: 'categoryBar::baz1',
                },
                {
                    label: 'count me in',
                    path: 'categoryFoo > barista',
                    value: 'categoryFoo::barista::count me in',
                },
                {
                    label: 'don’t count me off',
                    path: 'categoryFoo > barista',
                    value: 'categoryFoo::barista::don’t count me off',
                },
                {
                    label: 'bar in',
                    path: 'categoryFoo > fooista',
                    value: 'categoryFoo::fooista::bar in',
                },
            ])
        })

        it('should indicate that dropdownValue is in current search results', () => {
            const { result } = renderHook(() =>
                useSearch({
                    choices: {
                        [CHOICE_VALUES_SYMBOL]: new Set(['foo', 'bar', 'baz']),
                    } as ChoicesTree,
                    dropdownValue: 'bar',
                    isDisabled: false,
                }),
            )
            expect(result.current.valueIsInSearchResults).toEqual(false)
            act(() => {
                result.current.setSearch('bar')
            })
            expect(result.current.valueIsInSearchResults).toEqual(true)
        })
    })
})
