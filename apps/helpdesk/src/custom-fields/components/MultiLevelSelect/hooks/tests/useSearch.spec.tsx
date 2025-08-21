import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

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
        const choices = new Map([
            ['foo', { value: 'foo', children: new Map() }],
            ['bar', { value: 'bar', children: new Map() }],
            ['baz', { value: 'baz', children: new Map() }],
        ])

        const { result } = renderHook(() =>
            useSearch({
                choices,
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
            const choices = new Map([
                ['foo', { value: 'foo', children: new Map() }],
                ['bar', { value: 'bar', children: new Map() }],
                ['baz', { value: 'baz', children: new Map() }],
            ])

            const { result } = renderHook(() =>
                useSearch({
                    choices,
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
            let choices: ChoicesTree = new Map([
                ['Foo', { value: 'Foo', children: new Map() }],
                ['bar', { value: 'bar', children: new Map() }],
                ['baz', { value: 'baz', children: new Map() }],
            ])

            const { result, rerender } = renderHook(
                (props) => useSearch(props),
                {
                    initialProps: {
                        choices,
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

            choices = new Map([
                ['10', { value: 10, children: new Map() }],
                ['100', { value: 100, children: new Map() }],
                ['4', { value: 4, children: new Map() }],
                [
                    'bar',
                    {
                        value: 'bar',
                        children: new Map([
                            ['11', { value: 11, children: new Map() }],
                            ['101', { value: 101, children: new Map() }],
                            ['5', { value: 5, children: new Map() }],
                        ]),
                    },
                ],
            ])

            rerender({
                choices,
                dropdownValue: undefined,
                isDisabled: false,
            })
            act(() => {
                result.current.setSearch('bar')
            })
            expect(result.current.searchResults).toEqual([])

            choices = new Map([
                ['true', { value: true, children: new Map() }],
                ['false', { value: false, children: new Map() }],
                [
                    'bar',
                    {
                        value: 'bar',
                        children: new Map([
                            ['true', { value: true, children: new Map() }],
                            ['false', { value: false, children: new Map() }],
                        ]),
                    },
                ],
            ])
            rerender({
                choices,
                dropdownValue: undefined,
                isDisabled: false,
            })
            act(() => {
                result.current.setSearch('bar')
            })
            expect(result.current.searchResults).toEqual([])
        })

        it('should correctly search amongst nested choices and categories of string types', () => {
            const choices = new Map([
                ['foo', { value: 'foo', children: new Map() }],
                ['bar', { value: 'bar', children: new Map() }],
                ['baz', { value: 'baz', children: new Map() }],
                [
                    'categoryBar',
                    {
                        value: 'categoryBar',
                        children: new Map([
                            ['foo1', { value: 'foo1', children: new Map() }],
                            ['bar1', { value: 'bar1', children: new Map() }],
                            ['baz1', { value: 'baz1', children: new Map() }],
                        ]),
                    },
                ],
                [
                    'categoryFoo',
                    {
                        value: 'categoryFoo',
                        children: new Map([
                            [
                                'barista',
                                {
                                    value: 'barista',
                                    children: new Map([
                                        [
                                            'count me in',
                                            {
                                                value: 'count me in',
                                                children: new Map(),
                                            },
                                        ],
                                        [
                                            'don’t count me off',
                                            {
                                                value: 'don’t count me off',
                                                children: new Map(),
                                            },
                                        ],
                                    ]),
                                },
                            ],
                            [
                                'fooista',
                                {
                                    value: 'fooista',
                                    children: new Map([
                                        [
                                            'bar in',
                                            {
                                                value: 'bar in',
                                                children: new Map(),
                                            },
                                        ],
                                        [
                                            'foo off',
                                            {
                                                value: 'foo off',
                                                children: new Map(),
                                            },
                                        ],
                                    ]),
                                },
                            ],
                        ]),
                    },
                ],
            ])

            const { result } = renderHook(() =>
                useSearch({
                    choices,
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
            const choices = new Map([
                ['foo', { value: 'foo', children: new Map() }],
                ['bar', { value: 'bar', children: new Map() }],
                ['baz', { value: 'baz', children: new Map() }],
            ])

            const { result } = renderHook(() =>
                useSearch({
                    choices,
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
