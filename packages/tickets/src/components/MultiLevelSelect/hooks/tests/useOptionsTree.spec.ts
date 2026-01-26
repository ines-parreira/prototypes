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

            expect(result.current.selectOptions).toHaveLength(3)
            expect(result.current.selectOptions[0]).toMatchObject({
                type: OptionEnum.Back,
                label: 'Status',
            })
            expect(result.current.selectOptions[1]).toMatchObject({
                type: OptionEnum.Option,
                label: 'Open',
            })
            expect(result.current.selectOptions[2]).toMatchObject({
                type: OptionEnum.Option,
                label: 'Closed',
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

            expect(result.current.selectOptions).toHaveLength(3)

            act(() => {
                result.current.goBack()
            })

            expect(result.current.selectOptions).toHaveLength(2)
            expect(result.current.selectOptions[0].type).toBe(OptionEnum.Option)
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

            expect(result.current.selectOptions).toHaveLength(3)
            expect(result.current.selectOptions[0].type).toBe(OptionEnum.Back)
        })

        it('should reset to selected value path on resetPath', () => {
            const { result } = renderHook(() =>
                useOptionsTree({ choices, selectedValue: 'Status::Open' }),
            )

            act(() => {
                result.current.goBack()
            })

            expect(result.current.selectOptions).toHaveLength(2)

            act(() => {
                result.current.resetPath()
            })

            expect(result.current.selectOptions).toHaveLength(3)
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
            expect(result.current.selectOptions[0]).toMatchObject({
                type: OptionEnum.Option,
                label: 'Open',
                caption: 'Status',
                hasChildren: false,
            })
        })

        it('should not show back button when searching', () => {
            const { result } = renderHook(() =>
                useOptionsTree({
                    choices,
                    selectedValue: 'Status::Open',
                    searchTerm: 'status',
                }),
            )

            const backButton = result.current.selectOptions.find(
                (opt) => opt.type === OptionEnum.Back,
            )

            expect(backButton).toBeUndefined()
        })
    })
})
