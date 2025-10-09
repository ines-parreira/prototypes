import { useCallbackRef, useElementSize, useId } from '@repo/hooks'
import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import {
    TicketCustomFieldValue,
    useListCustomFields,
} from '@gorgias/helpdesk-queries'
import { ExpressionFieldType, RequirementType } from '@gorgias/helpdesk-types'

import getWrappedElementCount from 'common/utils/getWrappedElementCount'
import { useCustomFieldsConditionsEvaluationResults } from 'custom-fields/hooks/useCustomFieldsConditionsEvaluationResults'
import { apiListCursorPaginationResponse } from 'fixtures/axiosResponse'
import {
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
} from 'fixtures/customField'
import { useNotify } from 'hooks/useNotify'

import TicketFields from '../TicketFields'

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useListCustomFields: jest.fn(),
}))
jest.mock('common/utils/getWrappedElementCount')
jest.mock('hooks/useNotify')
jest.mock('custom-fields/hooks/useCustomFieldsConditionsEvaluationResults')

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useCallbackRef: jest.fn(() => [null, jest.fn()]),
    useElementSize: jest.fn(),
    useId: jest.fn(),
}))

const defaultProps = {
    fieldValues: {
        [ticketNumberFieldDefinition.id.toString()]: {
            value: 123,
        } as TicketCustomFieldValue,
        [ticketInputFieldDefinition.id.toString()]: {
            value: 'Test Value',
        } as TicketCustomFieldValue,
    },
    ticket: { id: 1 } as any,
}

const defaultFieldDefinitions = {
    data: {
        data: apiListCursorPaginationResponse([ticketInputFieldDefinition]),
    },
    isLoading: false,
} as ReturnType<typeof useListCustomFields>

const dualFieldDefinitions = {
    data: {
        data: apiListCursorPaginationResponse([
            ticketInputFieldDefinition,
            ticketNumberFieldDefinition,
        ]),
    },
    isLoading: false,
} as ReturnType<typeof useListCustomFields>

const useListCustomFieldsMock = assumeMock(useListCustomFields)
const getWrappedElementCountMock = assumeMock(getWrappedElementCount)
const useCallbackRefMock = assumeMock(useCallbackRef)
const useElementSizeMock = assumeMock(useElementSize)
const useIdMock = assumeMock(useId)
const useNotifyMock = assumeMock(useNotify)
const useCustomFieldsConditionsEvaluationResultsMock = assumeMock(
    useCustomFieldsConditionsEvaluationResults,
)

describe('TicketFields', () => {
    beforeEach(() => {
        useListCustomFieldsMock.mockReturnValue(defaultFieldDefinitions)
        getWrappedElementCountMock.mockReturnValue(0)
        useCallbackRefMock.mockReturnValue([null, jest.fn()])
        useElementSizeMock.mockReturnValue([100, 100])
        useIdMock.mockReturnValue('test-id')
        useNotifyMock.mockReturnValue({
            error: jest.fn(),
            success: jest.fn(),
            info: jest.fn(),
            warning: jest.fn(),
            notify: jest.fn(),
        })
        useCustomFieldsConditionsEvaluationResultsMock.mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })
    })

    it('should display a loading message when isLoading is true', () => {
        useListCustomFieldsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as ReturnType<typeof useListCustomFields>)
        render(<TicketFields {...defaultProps} />)

        expect(screen.getByText('Loading ticket fields...')).toBeInTheDocument()
    })

    it('should display a message when there are no ticket fields', () => {
        const { rerender } = render(
            <TicketFields {...defaultProps} fieldValues={null} />,
        )
        expect(screen.getByText('No ticket fields yet')).toBeInTheDocument()

        rerender(<TicketFields {...defaultProps} fieldValues={undefined} />)
        expect(screen.getByText('No ticket fields yet')).toBeInTheDocument()
    })

    it('should display a default label when there is no matching definition', () => {
        const unknownFieldDefinition = {
            id: 1234,
            label: '',
            required: false,
            requirement_type: RequirementType.Visible,
        }
        useListCustomFieldsMock.mockReturnValue({
            data: {
                data: apiListCursorPaginationResponse([
                    ticketInputFieldDefinition,
                    unknownFieldDefinition as any,
                ]),
            },
            isLoading: false,
        } as ReturnType<typeof useListCustomFields>)

        const fieldValuesWithUnknownField = {
            ...defaultProps.fieldValues,
            ['1234']: {
                value: 'Unknown Field Value',
            } as TicketCustomFieldValue,
        }
        render(
            <TicketFields
                {...defaultProps}
                fieldValues={fieldValuesWithUnknownField}
            />,
        )
        expect(screen.getByText('Custom Field 1234')).toBeInTheDocument()
        expect(screen.getByText('Unknown Field Value')).toBeInTheDocument()
    })

    it('should display ticket fields when they are available', () => {
        render(<TicketFields {...defaultProps} />)
        expect(
            screen.getByText(ticketInputFieldDefinition.label),
        ).toBeInTheDocument()
        expect(screen.getByText('Test Value')).toBeInTheDocument()
    })

    it('should display the correct number of hidden ticket fields', () => {
        getWrappedElementCountMock.mockReturnValue(1)
        useListCustomFieldsMock.mockReturnValue(dualFieldDefinitions)
        render(<TicketFields {...defaultProps} />)
        expect(screen.getByText('+1 more')).toBeInTheDocument()
    })

    it('should call useElementSize', () => {
        render(<TicketFields {...defaultProps} />)
        expect(useElementSize).toHaveBeenCalled()
    })

    it('should display hidden ticket fields in the tooltip', () => {
        getWrappedElementCountMock.mockReturnValue(1)
        useListCustomFieldsMock.mockReturnValue(dualFieldDefinitions)
        render(<TicketFields {...defaultProps} />)

        expect(
            screen.getAllByText(new RegExp(ticketNumberFieldDefinition.label)),
        ).toHaveLength(1)
        expect(
            screen.getAllByText(ticketInputFieldDefinition.id.toString()),
        ).toHaveLength(1)

        const showMore = screen.getByText('+1 more')
        fireEvent.focus(showMore)

        expect(
            screen.getAllByText(new RegExp(ticketNumberFieldDefinition.label)),
        ).toHaveLength(2)
        expect(
            screen.getAllByText(ticketInputFieldDefinition.id.toString()),
        ).toHaveLength(2)
    })

    it('should not hide any ticket fields when multiline is true', () => {
        render(<TicketFields {...defaultProps} isMultiline />)

        expect(screen.queryByText('+1 more')).not.toBeInTheDocument()
    })

    it('should apply the correct classNames when isBold is true', () => {
        render(<TicketFields {...defaultProps} isBold />)

        expect(screen.getByText('Test Value')).toHaveClass('bold')
    })

    describe('conditional field visibility', () => {
        it('should hide fields when conditions evaluate to hidden', () => {
            const conditionalField = {
                ...ticketInputFieldDefinition,
                required: false,
                requirement_type: RequirementType.Conditional,
            }
            useListCustomFieldsMock.mockReturnValue({
                data: {
                    data: apiListCursorPaginationResponse([
                        conditionalField,
                        ticketNumberFieldDefinition,
                    ]),
                },
                isLoading: false,
            } as ReturnType<typeof useListCustomFields>)

            useCustomFieldsConditionsEvaluationResultsMock.mockReturnValue({
                evaluationResults: {},
                conditionsLoading: false,
            })

            render(<TicketFields {...defaultProps} />)

            expect(screen.queryByText('Test Value')).not.toBeInTheDocument()
            expect(screen.getByText('123')).toBeInTheDocument()
        })

        it('should show fields when conditions evaluate to visible', () => {
            const conditionalField = {
                ...ticketInputFieldDefinition,
                required: false,
                requirement_type: RequirementType.Conditional,
            }
            useListCustomFieldsMock.mockReturnValue({
                data: {
                    data: apiListCursorPaginationResponse([
                        conditionalField,
                        ticketNumberFieldDefinition,
                    ]),
                },
                isLoading: false,
            } as ReturnType<typeof useListCustomFields>)

            useCustomFieldsConditionsEvaluationResultsMock.mockReturnValue({
                evaluationResults: {
                    [conditionalField.id]: ExpressionFieldType.Visible,
                    [ticketNumberFieldDefinition.id]:
                        ExpressionFieldType.Visible,
                },
                conditionsLoading: false,
            })

            render(<TicketFields {...defaultProps} />)

            expect(screen.getByText('Test Value')).toBeInTheDocument()
            expect(screen.getByText('123')).toBeInTheDocument()
        })

        it('should show fields when they are required regardless of conditions', () => {
            const requiredField = {
                ...ticketInputFieldDefinition,
                required: true,
                requirement_type: RequirementType.Required,
            }
            useListCustomFieldsMock.mockReturnValue({
                data: {
                    data: apiListCursorPaginationResponse([
                        requiredField,
                        ticketNumberFieldDefinition,
                    ]),
                },
                isLoading: false,
            } as ReturnType<typeof useListCustomFields>)

            useCustomFieldsConditionsEvaluationResultsMock.mockReturnValue({
                evaluationResults: {},
                conditionsLoading: false,
            })

            render(<TicketFields {...defaultProps} />)

            expect(screen.getByText('Test Value')).toBeInTheDocument()
        })

        it('should display loading message when conditions are loading', () => {
            useCustomFieldsConditionsEvaluationResultsMock.mockReturnValue({
                evaluationResults: {},
                conditionsLoading: true,
            })

            render(<TicketFields {...defaultProps} />)

            expect(
                screen.getByText('Loading ticket fields...'),
            ).toBeInTheDocument()
        })

        it('should filter out AI managed fields', () => {
            const aiManagedField = {
                ...ticketInputFieldDefinition,
                id: 9999,
                managed_type: 'ai_intent',
            }
            useListCustomFieldsMock.mockReturnValue({
                data: {
                    data: apiListCursorPaginationResponse([
                        ticketInputFieldDefinition,
                        aiManagedField,
                    ]),
                },
                isLoading: false,
            } as ReturnType<typeof useListCustomFields>)

            const fieldValues = {
                ...defaultProps.fieldValues,
                ['9999']: { value: 'AI Value' } as TicketCustomFieldValue,
            }

            render(<TicketFields {...defaultProps} fieldValues={fieldValues} />)

            expect(screen.queryByText('AI Value')).not.toBeInTheDocument()
            expect(screen.getByText('Test Value')).toBeInTheDocument()
        })

        it('should handle conditional required fields', () => {
            const conditionalRequiredField = {
                ...ticketInputFieldDefinition,
                required: false,
                requirement_type: RequirementType.Conditional,
            }
            useListCustomFieldsMock.mockReturnValue({
                data: {
                    data: apiListCursorPaginationResponse([
                        conditionalRequiredField,
                    ]),
                },
                isLoading: false,
            } as ReturnType<typeof useListCustomFields>)

            useCustomFieldsConditionsEvaluationResultsMock.mockReturnValue({
                evaluationResults: {
                    [conditionalRequiredField.id]: ExpressionFieldType.Required,
                },
                conditionsLoading: false,
            })

            render(<TicketFields {...defaultProps} />)

            expect(screen.getByText('Test Value')).toBeInTheDocument()
        })
    })
})
