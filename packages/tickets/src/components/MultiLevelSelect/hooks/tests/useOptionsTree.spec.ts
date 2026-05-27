import { act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderHook } from '../../../../tests/render.utils'
import type { TreeOption } from '../../types'
import { OptionEnum } from '../../types'
import { useOptionsTree } from '../useOptionsTree'

describe('useOptionsTree', () => {
    const choices = [
        'Status::Open',
        'Status::Closed',
        'Priority::High',
        'Priority::Low',
    ]
    const parentOnlyChoices = [
        'high level',
        'high level::123',
        'high level::456',
    ]

    describe('hierarchical navigation', () => {
        it('should return root level options', () => {
            const { result } = renderHook(() =>
                useOptionsTree({ choices, selectedValue: undefined }),
            )

            expect(result.current.selectOptions).toHaveLength(2)
            expect(result.current.selectOptions[0]).toMatchObject({
                type: OptionEnum.Option,
                label: 'Status',
                hasChildren: true,
            })
            expect(result.current.selectOptions[1]).toMatchObject({
                type: OptionEnum.Option,
                label: 'Priority',
                hasChildren: true,
            })
        })

        it('should navigate to child level', () => {
            const { result } = renderHook(() =>
                useOptionsTree({ choices, selectedValue: undefined }),
            )

            const statusOption = result.current.selectOptions[0]
            act(() => {
                result.current.goToLevel(statusOption as TreeOption)
            })

            expect(result.current.selectOptions).toHaveLength(2)
            expect(result.current.selectOptions[0]).toMatchObject({
                type: OptionEnum.Option,
                label: 'Open',
            })
            expect(result.current.selectOptions[1]).toMatchObject({
                type: OptionEnum.Option,
                label: 'Closed',
            })
            expect(result.current.navigationState).toEqual({
                canGoBack: true,
                parentLevelName: 'Status',
            })
        })

        it('should show parent-only values after navigating into their parent level', () => {
            const { result } = renderHook(() =>
                useOptionsTree({
                    choices: parentOnlyChoices,
                    selectedValue: undefined,
                }),
            )

            act(() => {
                result.current.goToLevel(result.current.selectOptions[0])
            })

            expect(result.current.selectOptions).toEqual([
                {
                    type: OptionEnum.Option,
                    id: 'high level',
                    label: 'high level',
                    value: 'high level',
                    path: ['high level'],
                    hasChildren: false,
                },
                {
                    type: OptionEnum.Option,
                    id: '123',
                    label: '123',
                    value: 'high level::123',
                    path: ['high level', '123'],
                    hasChildren: false,
                },
                {
                    type: OptionEnum.Option,
                    id: '456',
                    label: '456',
                    value: 'high level::456',
                    path: ['high level', '456'],
                    hasChildren: false,
                },
            ])
        })

        it('should go back to parent level', () => {
            const { result } = renderHook(() =>
                useOptionsTree({ choices, selectedValue: undefined }),
            )

            const statusOption = result.current.selectOptions[0]
            act(() => {
                result.current.goToLevel(statusOption as TreeOption)
            })

            expect(result.current.selectOptions).toHaveLength(2)
            expect(result.current.navigationState.canGoBack).toBe(true)

            act(() => {
                result.current.goBack()
            })

            expect(result.current.selectOptions).toHaveLength(2)
            expect(result.current.selectOptions[0].type).toBe(OptionEnum.Option)
            expect(result.current.navigationState.canGoBack).toBe(false)
        })
    })

    describe('selected value', () => {
        it('should return selected option', () => {
            const { result } = renderHook(() =>
                useOptionsTree({ choices, selectedValue: 'Status::Open' }),
            )

            const statusOption = result.current.selectOptions[0]
            result.current.goToLevel(statusOption as TreeOption)

            expect(result.current.selectedOption).toMatchObject({
                label: 'Open',
                value: 'Status::Open',
                path: ['Status', 'Open'],
                hasChildren: false,
            })
        })

        it('should initialize at parent path of selected value', () => {
            const { result } = renderHook(() =>
                useOptionsTree({ choices, selectedValue: 'Status::Open' }),
            )

            expect(result.current.selectOptions).toHaveLength(2)
            expect(result.current.navigationState).toEqual({
                canGoBack: true,
                parentLevelName: 'Status',
            })
        })

        it('should initialize at selected parent-only value level', () => {
            const { result } = renderHook(() =>
                useOptionsTree({
                    choices: parentOnlyChoices,
                    selectedValue: 'high level',
                }),
            )

            expect(result.current.selectOptions).toEqual([
                {
                    type: OptionEnum.Option,
                    id: 'high level',
                    label: 'high level',
                    value: 'high level',
                    path: ['high level'],
                    hasChildren: false,
                },
                {
                    type: OptionEnum.Option,
                    id: '123',
                    label: '123',
                    value: 'high level::123',
                    path: ['high level', '123'],
                    hasChildren: false,
                },
                {
                    type: OptionEnum.Option,
                    id: '456',
                    label: '456',
                    value: 'high level::456',
                    path: ['high level', '456'],
                    hasChildren: false,
                },
            ])
            expect(result.current.navigationState).toEqual({
                canGoBack: true,
                parentLevelName: 'high level',
            })
        })

        it('should reset to selected value path on resetPath', () => {
            const { result } = renderHook(() =>
                useOptionsTree({ choices, selectedValue: 'Status::Open' }),
            )

            act(() => {
                result.current.goBack()
            })

            expect(result.current.selectOptions).toHaveLength(2)
            expect(result.current.navigationState.canGoBack).toBe(false)

            act(() => {
                result.current.resetPath()
            })

            expect(result.current.selectOptions).toHaveLength(2)
            expect(result.current.navigationState).toEqual({
                canGoBack: true,
                parentLevelName: 'Status',
            })
        })
    })

    describe('search mode', () => {
        it('should flatten options when searching and filter by search term, case insensitive', () => {
            const { result } = renderHook(() =>
                useOptionsTree({
                    choices,
                    selectedValue: undefined,
                    searchTerm: 'OPEN',
                }),
            )

            expect(result.current.selectOptions).toHaveLength(1)
            expect(result.current.selectOptions).toEqual([
                {
                    caption: 'Status',
                    hasChildren: false,
                    id: 'Status::Open',
                    label: 'Open',
                    path: ['Status', 'Open'],
                    type: OptionEnum.Option,
                    value: 'Status::Open',
                },
            ])
        })

        it('should flatten option when searching, and allow filtering by parent value', () => {
            const { result } = renderHook(() =>
                useOptionsTree({
                    choices,
                    selectedValue: undefined,
                    searchTerm: 'Status',
                }),
            )

            expect(result.current.selectOptions).toHaveLength(2)
            expect(result.current.selectOptions).toEqual([
                {
                    caption: 'Status',
                    hasChildren: false,
                    id: 'Status::Open',
                    label: 'Open',
                    path: ['Status', 'Open'],
                    type: OptionEnum.Option,
                    value: 'Status::Open',
                },
                {
                    caption: 'Status',
                    hasChildren: false,
                    id: 'Status::Closed',
                    label: 'Closed',
                    path: ['Status', 'Closed'],
                    type: OptionEnum.Option,
                    value: 'Status::Closed',
                },
            ])
        })

        it('should not allow going back when searching', () => {
            const { result } = renderHook(() =>
                useOptionsTree({
                    choices,
                    selectedValue: 'Status::Open',
                    searchTerm: 'status',
                }),
            )

            expect(result.current.navigationState.canGoBack).toBe(false)
        })
    })
})
