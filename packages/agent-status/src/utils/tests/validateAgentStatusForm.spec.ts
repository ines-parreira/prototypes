import { describe, expect, it } from 'vitest'

import { DURATION_OPTIONS } from '../../constants'
import { validateAgentStatusForm } from '../validateAgentStatusForm'

const CUSTOM_OPTION = DURATION_OPTIONS[DURATION_OPTIONS.length - 1]

describe('validateAgentStatusForm', () => {
    describe('name validation', () => {
        it.each([
            ['empty string', ''],
            ['whitespace only', '   '],
        ])('should return error when name is %s', (_, name) => {
            expect(
                validateAgentStatusForm({
                    name,
                    description: '',
                    durationOption: DURATION_OPTIONS[0],
                }),
            ).toEqual({ name: 'Status name is required' })
        })

        it('should pass validation when name is provided', () => {
            expect(
                validateAgentStatusForm({
                    name: 'On Break',
                    description: '',
                    durationOption: DURATION_OPTIONS[0],
                }),
            ).toBeUndefined()
        })
    })

    describe('preset duration validation', () => {
        it('should pass validation for preset options', () => {
            expect(
                validateAgentStatusForm({
                    name: 'On Break',
                    description: '',
                    durationOption: DURATION_OPTIONS[1],
                }),
            ).toBeUndefined()
        })
    })

    describe('custom duration validation', () => {
        it('should return error when custom value is missing', () => {
            expect(
                validateAgentStatusForm({
                    name: 'On Break',
                    description: '',
                    durationOption: CUSTOM_OPTION,
                    customDurationUnit: 'hours',
                }),
            ).toEqual({ customDurationValue: 'Duration value is required' })
        })

        it('should return error when custom unit is missing', () => {
            expect(
                validateAgentStatusForm({
                    name: 'On Break',
                    description: '',
                    durationOption: CUSTOM_OPTION,
                    customDurationValue: 2,
                }),
            ).toEqual({ customDurationUnit: 'Duration unit is required' })
        })

        it('should return error when both custom value and unit are missing', () => {
            expect(
                validateAgentStatusForm({
                    name: 'On Break',
                    description: '',
                    durationOption: CUSTOM_OPTION,
                }),
            ).toEqual({
                customDurationValue: 'Duration value is required',
                customDurationUnit: 'Duration unit is required',
            })
        })

        it.each([
            ['minutes', 0, 525599, 'Must be between 1 and 525599 minutes'],
            ['minutes', 525600, 525599, 'Must be between 1 and 525599 minutes'],
            ['hours', 0, 8759, 'Must be between 1 and 8759 hours'],
            ['hours', 8760, 8759, 'Must be between 1 and 8759 hours'],
            ['days', 0, 364, 'Must be between 1 and 364 days'],
            ['days', 365, 364, 'Must be between 1 and 364 days'],
        ] as const)(
            'should return error for %s with value %i (max: %i)',
            (unit, value, _, expectedError) => {
                expect(
                    validateAgentStatusForm({
                        name: 'On Break',
                        description: '',
                        durationOption: CUSTOM_OPTION,
                        customDurationValue: value,
                        customDurationUnit: unit,
                    }),
                ).toEqual({ customDurationValue: expectedError })
            },
        )

        it.each([
            ['minutes', 45],
            ['hours', 2],
            ['days', 7],
        ] as const)(
            'should pass validation for valid %s value %i',
            (unit, value) => {
                expect(
                    validateAgentStatusForm({
                        name: 'On Break',
                        description: '',
                        durationOption: CUSTOM_OPTION,
                        customDurationValue: value,
                        customDurationUnit: unit,
                    }),
                ).toBeUndefined()
            },
        )
    })

    describe('combined validation errors', () => {
        it('should return multiple errors when both name and custom duration are invalid', () => {
            expect(
                validateAgentStatusForm({
                    name: '',
                    description: '',
                    durationOption: CUSTOM_OPTION,
                    customDurationValue: 0,
                    customDurationUnit: 'hours',
                }),
            ).toEqual({
                name: 'Status name is required',
                customDurationValue: 'Must be between 1 and 8759 hours',
            })
        })
    })
})
