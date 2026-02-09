import { useTicketFieldsStore } from '../store/useTicketFieldsStore'
import type { TicketFieldsState } from '../store/useTicketFieldsStore'

describe('useTicketFieldsStore', () => {
    beforeEach(() => {
        useTicketFieldsStore.getState().resetFields()
    })

    describe('updateFieldState', () => {
        it('should add a new field to the store', () => {
            const store = useTicketFieldsStore.getState()

            store.updateFieldState({
                id: 1,
                value: 'test value',
            })

            const fields = useTicketFieldsStore.getState().fields
            expect(fields[1]).toEqual({
                id: 1,
                value: 'test value',
            })
        })

        it('should update an existing field completely', () => {
            const store = useTicketFieldsStore.getState()

            store.updateFieldState({
                id: 1,
                value: 'initial',
                hasError: false,
            })

            store.updateFieldState({
                id: 1,
                value: 'updated',
                hasError: true,
            })

            const fields = useTicketFieldsStore.getState().fields
            expect(fields[1]).toEqual({
                id: 1,
                value: 'updated',
                hasError: true,
            })
        })
    })

    describe('updateFieldValue', () => {
        it('should update only the value of a field and clear error state', () => {
            const store = useTicketFieldsStore.getState()

            store.updateFieldValue(1, 'new value')

            const fields = useTicketFieldsStore.getState().fields
            expect(fields[1]).toEqual({
                id: 1,
                value: 'new value',
                hasError: false,
            })
        })

        it('should clear error state when updating value', () => {
            const store = useTicketFieldsStore.getState()

            store.updateFieldState({
                id: 1,
                value: 'initial',
                hasError: true,
            })

            store.updateFieldValue(1, 'updated value')

            const fields = useTicketFieldsStore.getState().fields
            expect(fields[1]).toEqual({
                id: 1,
                value: 'updated value',
                hasError: false,
            })
        })

        it('should handle different value types (string, number, boolean, undefined)', () => {
            const store = useTicketFieldsStore.getState()

            store.updateFieldValue(1, 'text')
            expect(useTicketFieldsStore.getState().fields[1]).toEqual({
                id: 1,
                value: 'text',
                hasError: false,
            })

            store.updateFieldValue(2, 42)
            expect(useTicketFieldsStore.getState().fields[2]).toEqual({
                id: 2,
                value: 42,
                hasError: false,
            })

            store.updateFieldValue(3, true)
            expect(useTicketFieldsStore.getState().fields[3]).toEqual({
                id: 3,
                value: true,
                hasError: false,
            })

            store.updateFieldValue(1, undefined)
            expect(useTicketFieldsStore.getState().fields[1]).toEqual({
                id: 1,
                value: undefined,
                hasError: false,
            })
        })
    })

    describe('updateFieldError', () => {
        it('should set error state on a field', () => {
            const store = useTicketFieldsStore.getState()

            store.updateFieldError(1, true)

            const fields = useTicketFieldsStore.getState().fields
            expect(fields[1]).toEqual({
                id: 1,
                hasError: true,
            })
        })

        it('should clear error state on a field', () => {
            const store = useTicketFieldsStore.getState()

            store.updateFieldError(1, true)
            store.updateFieldError(1, false)

            const fields = useTicketFieldsStore.getState().fields
            expect(fields[1]).toEqual({
                id: 1,
                hasError: false,
            })
        })

        it('should preserve other field properties when updating error', () => {
            const store = useTicketFieldsStore.getState()

            store.updateFieldState({
                id: 1,
                value: 'test',
                hasError: false,
            })

            store.updateFieldError(1, true)

            const fields = useTicketFieldsStore.getState().fields
            expect(fields[1]).toEqual({
                id: 1,
                value: 'test',
                hasError: true,
            })
        })
    })

    describe('updateFieldPrediction', () => {
        it('should add prediction to a field', () => {
            const store = useTicketFieldsStore.getState()

            const prediction = {
                confidence: 0.95,
                confirmed: false,
                display: true,
                modified: false,
                predicted: 'Predicted value',
            }

            store.updateFieldPrediction(1, prediction)

            const fields = useTicketFieldsStore.getState().fields
            expect(fields[1]).toEqual({
                id: 1,
                prediction,
            })
        })

        it('should preserve other field properties when adding prediction', () => {
            const store = useTicketFieldsStore.getState()

            store.updateFieldState({
                id: 1,
                value: 'manual value',
                hasError: false,
            })

            const prediction = {
                confidence: 0.8,
                confirmed: true,
                display: true,
                modified: true,
                predicted: 'AI predicted',
            }

            store.updateFieldPrediction(1, prediction)

            const fields = useTicketFieldsStore.getState().fields
            expect(fields[1]).toEqual({
                id: 1,
                value: 'manual value',
                hasError: false,
                prediction,
            })
        })
    })

    describe('incrementValidationFailureCount', () => {
        it('should increment validationFailureCount by 1', () => {
            const store = useTicketFieldsStore.getState()

            expect(useTicketFieldsStore.getState().validationFailureCount).toBe(
                0,
            )

            store.incrementValidationFailureCount()

            expect(useTicketFieldsStore.getState().validationFailureCount).toBe(
                1,
            )
        })

        it('should increment validationFailureCount on repeated calls', () => {
            const store = useTicketFieldsStore.getState()

            store.incrementValidationFailureCount()
            store.incrementValidationFailureCount()
            store.incrementValidationFailureCount()

            expect(useTicketFieldsStore.getState().validationFailureCount).toBe(
                3,
            )
        })
    })

    describe('initializeFields', () => {
        it('should initialize store with multiple fields', () => {
            const store = useTicketFieldsStore.getState()

            const initialFields: TicketFieldsState = {
                '1': {
                    id: 1,
                    value: 'Field 1',
                },
                '2': {
                    id: 2,
                    value: 42,
                },
                '3': {
                    id: 3,
                    value: 'Field 3',
                    hasError: true,
                },
            }

            store.initializeFields(initialFields)

            expect(useTicketFieldsStore.getState().fields).toEqual(
                initialFields,
            )
        })

        it('should replace existing fields when initializing', () => {
            const store = useTicketFieldsStore.getState()

            store.updateFieldValue(1, 'old value')
            store.updateFieldValue(2, 'another old value')

            const newFields: TicketFieldsState = {
                '3': {
                    id: 3,
                    value: 'new field',
                },
            }

            store.initializeFields(newFields)

            const fields = useTicketFieldsStore.getState().fields
            expect(fields).toEqual(newFields)
            expect(fields[1]).toBeUndefined()
            expect(fields[2]).toBeUndefined()
        })
    })

    describe('resetFields', () => {
        it('should clear all fields and reset validationFailureCount', () => {
            const store = useTicketFieldsStore.getState()

            store.updateFieldValue(1, 'value 1')
            store.updateFieldValue(2, 'value 2')
            store.updateFieldState({
                id: 3,
                value: 'test',
                hasError: true,
                prediction: {
                    confidence: 0.9,
                    confirmed: true,
                    display: true,
                    modified: false,
                    predicted: 'AI value',
                },
            })
            store.incrementValidationFailureCount()
            store.incrementValidationFailureCount()

            // Reset everything
            store.resetFields()

            // Verify all state is cleared
            expect(useTicketFieldsStore.getState().fields).toEqual({})
            expect(useTicketFieldsStore.getState().validationFailureCount).toBe(
                0,
            )
        })
    })
})
