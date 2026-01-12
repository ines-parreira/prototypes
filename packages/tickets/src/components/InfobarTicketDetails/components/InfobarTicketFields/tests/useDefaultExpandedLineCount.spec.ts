import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CustomField } from '@gorgias/helpdesk-types'
import { RequirementType } from '@gorgias/helpdesk-types'

import { useDefaultExpandedLineCount } from '../hooks/useDefaultExpandedLineCount'
import type { VisibleTicketField } from '../hooks/useFilteredTicketFields'
import { useTicketFields } from '../hooks/useTicketFields'
import { useTicketFieldsStore } from '../store/useTicketFieldsStore'

vi.mock('../hooks/useTicketFields')
const mockUseTicketFields = vi.mocked(useTicketFields)

describe('useDefaultExpandedLineCount', () => {
    beforeEach(() => {
        useTicketFieldsStore.getState().resetFields()
        vi.clearAllMocks()
    })

    const createTicketField = (
        id: number,
        label: string,
        isRequired = false,
    ): VisibleTicketField => ({
        fieldDefinition: {
            id,
            label,
            required: isRequired,
            requirement_type: RequirementType.Visible,
        } as CustomField,
        isRequired,
    })

    describe('loading state', () => {
        it('should return minimum line count (3) when data is loading', () => {
            mockUseTicketFields.mockReturnValue({
                ticketFields: [],
                isLoading: true,
            })

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(3)
        })
    })

    describe('no fields', () => {
        it('should return minimum line count (3) when there are no ticket fields', () => {
            mockUseTicketFields.mockReturnValue({
                ticketFields: [],
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(3)
        })
    })

    describe('no required or filled fields', () => {
        it('should return minimum line count (3) when no fields are required or filled', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1'),
                createTicketField(2, 'Field 2'),
                createTicketField(3, 'Field 3'),
                createTicketField(4, 'Field 4'),
                createTicketField(5, 'Field 5'),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(3)
        })
    })

    describe('required fields only', () => {
        it('should return minimum (3) when required fields are within first 3 indices', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1', true),
                createTicketField(2, 'Field 2', true),
                createTicketField(3, 'Field 3'),
                createTicketField(4, 'Field 4'),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(3)
        })

        it('should return correct count when required field is beyond index 2', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1'),
                createTicketField(2, 'Field 2'),
                createTicketField(3, 'Field 3'),
                createTicketField(4, 'Field 4', true),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(4)
        })

        it('should return last required field index + 1 when multiple required fields exist', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1', true),
                createTicketField(2, 'Field 2'),
                createTicketField(3, 'Field 3'),
                createTicketField(4, 'Field 4'),
                createTicketField(5, 'Field 5', true),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(5)
        })
    })

    describe('filled fields only', () => {
        it('should return minimum (3) when filled fields are within first 3 indices', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1'),
                createTicketField(2, 'Field 2'),
                createTicketField(3, 'Field 3'),
                createTicketField(4, 'Field 4'),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const store = useTicketFieldsStore.getState()
            store.updateFieldValue(1, 'some value')
            store.updateFieldValue(2, 'another value')

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(3)
        })

        it('should return correct count when filled field is beyond index 2', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1'),
                createTicketField(2, 'Field 2'),
                createTicketField(3, 'Field 3'),
                createTicketField(4, 'Field 4'),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const store = useTicketFieldsStore.getState()
            store.updateFieldValue(4, 'some value')

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(4)
        })

        it('should handle numeric values including 0', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1'),
                createTicketField(2, 'Field 2'),
                createTicketField(3, 'Field 3'),
                createTicketField(4, 'Field 4'),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const store = useTicketFieldsStore.getState()
            store.updateFieldValue(4, 0)

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(4)
        })

        it('should handle boolean values', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1'),
                createTicketField(2, 'Field 2'),
                createTicketField(3, 'Field 3'),
                createTicketField(4, 'Field 4'),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const store = useTicketFieldsStore.getState()
            store.updateFieldValue(4, false)

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(4)
        })
    })

    describe('mixed required and filled fields', () => {
        it('should return the higher index when required and filled fields are at different indices', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1'),
                createTicketField(2, 'Field 2'),
                createTicketField(3, 'Field 3', true),
                createTicketField(4, 'Field 4'),
                createTicketField(5, 'Field 5'),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const store = useTicketFieldsStore.getState()
            store.updateFieldValue(5, 'filled value')

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(5)
        })

        it('should handle overlapping required and filled status', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1', true),
                createTicketField(2, 'Field 2'),
                createTicketField(3, 'Field 3'),
                createTicketField(4, 'Field 4', true),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const store = useTicketFieldsStore.getState()
            store.updateFieldValue(1, 'required and filled')
            store.updateFieldValue(4, 'required and filled')

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(4)
        })
    })

    describe('empty values should not count as filled', () => {
        it('should not count empty string as filled', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1'),
                createTicketField(2, 'Field 2'),
                createTicketField(3, 'Field 3'),
                createTicketField(4, 'Field 4'),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const store = useTicketFieldsStore.getState()
            store.updateFieldValue(4, '')

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(3)
        })

        it('should not count undefined as filled', () => {
            const ticketFields = [
                createTicketField(1, 'Field 1'),
                createTicketField(2, 'Field 2'),
                createTicketField(3, 'Field 3'),
                createTicketField(4, 'Field 4'),
            ]

            mockUseTicketFields.mockReturnValue({
                ticketFields,
                isLoading: false,
            })

            const store = useTicketFieldsStore.getState()
            store.updateFieldValue(4, undefined)

            const { result } = renderHook(() =>
                useDefaultExpandedLineCount(
                    useTicketFieldsStore.getState().fields,
                ),
            )

            expect(result.current).toBe(3)
        })
    })
})
