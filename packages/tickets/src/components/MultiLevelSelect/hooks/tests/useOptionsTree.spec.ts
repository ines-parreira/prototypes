import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

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
