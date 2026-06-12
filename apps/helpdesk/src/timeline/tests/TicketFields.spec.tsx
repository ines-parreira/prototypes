import { assumeMock, render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { useCallbackRef, useElementSize, useId } from '@gorgias/toolkit-react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockListCustomFieldsHandler,
    mockListCustomFieldsResponse,
} from '@gorgias/helpdesk-mocks'
import type { TicketCustomFieldValue } from '@gorgias/helpdesk-queries'
import { ExpressionFieldType, RequirementType } from '@gorgias/helpdesk-types'

import { getWrappedElementCount } from 'common/utils/getWrappedElementCount'
import { useCustomFieldsConditionsEvaluationResults } from 'custom-fields/hooks/useCustomFieldsConditionsEvaluationResults'
import {
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
} from 'fixtures/customField'

import { TicketFields } from '../TicketFields'

jest.mock('common/utils/getWrappedElementCount')
jest.mock('custom-fields/hooks/useCustomFieldsConditionsEvaluationResults')

jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
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

const getWrappedElementCountMock = assumeMock(getWrappedElementCount)
const useCallbackRefMock = assumeMock(useCallbackRef)
const useElementSizeMock = assumeMock(useElementSize)
const useIdMock = assumeMock(useId)
const useCustomFieldsConditionsEvaluationResultsMock = assumeMock(
    useCustomFieldsConditionsEvaluationResults,
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('TicketFields', () => {
    const mockFieldDefinitions = (fieldDefinitions: unknown[]) => {
        server.use(
            mockListCustomFieldsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldsResponse({
                        data: fieldDefinitions as any,
                    }),
                ),
            ).handler,
        )
    }

    beforeEach(() => {
        mockFieldDefinitions([ticketInputFieldDefinition])
        getWrappedElementCountMock.mockReturnValue(0)
        useCallbackRefMock.mockReturnValue([null, jest.fn()])
        useElementSizeMock.mockReturnValue([100, 100])
        useIdMock.mockReturnValue('test-id')
        useCustomFieldsConditionsEvaluationResultsMock.mockReturnValue({
            evaluationResults: {},
            conditionsLoading: false,
        })
    })

    it('should display a loading message when isLoading is true', () => {
        server.use(
            mockListCustomFieldsHandler(
                async () => new Promise(() => undefined),
            ).handler,
        )
        render(<TicketFields {...defaultProps} />)

        expect(screen.getByText('Loading ticket fields...')).toBeInTheDocument()
    })

    it('should display a message when there are no ticket fields', async () => {
        const { rerender } = render(
            <TicketFields {...defaultProps} fieldValues={null} />,
        )
        expect(
            await screen.findByText('No ticket fields yet'),
        ).toBeInTheDocument()

        rerender(<TicketFields {...defaultProps} fieldValues={undefined} />)
        expect(
            await screen.findByText('No ticket fields yet'),
        ).toBeInTheDocument()
    })

    it('should display a default label when there is no matching definition', async () => {
        const unknownFieldDefinition = {
            id: 1234,
            label: '',
            required: false,
            requirement_type: RequirementType.Visible,
        }
        mockFieldDefinitions([
            ticketInputFieldDefinition,
            unknownFieldDefinition,
        ])

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
        expect(await screen.findByText('Custom Field 1234')).toBeInTheDocument()
        expect(screen.getByText('Unknown Field Value')).toBeInTheDocument()
    })

    it('should display ticket fields when they are available', async () => {
        render(<TicketFields {...defaultProps} />)
        expect(
            await screen.findByText(ticketInputFieldDefinition.label),
        ).toBeInTheDocument()
        expect(screen.getByText('Test Value')).toBeInTheDocument()
    })

    it('should display the correct number of hidden ticket fields', async () => {
        getWrappedElementCountMock.mockReturnValue(1)
        mockFieldDefinitions([
            ticketInputFieldDefinition,
            ticketNumberFieldDefinition,
        ])
        render(<TicketFields {...defaultProps} />)
        expect(await screen.findByText('+1 more')).toBeInTheDocument()
    })

    it('should call useElementSize', () => {
        render(<TicketFields {...defaultProps} />)
        expect(useElementSize).toHaveBeenCalled()
    })

    it('should display hidden ticket fields in the tooltip', async () => {
        getWrappedElementCountMock.mockReturnValue(1)
        mockFieldDefinitions([
            ticketInputFieldDefinition,
            ticketNumberFieldDefinition,
        ])
        render(<TicketFields {...defaultProps} />)

        await screen.findByText('+1 more')
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

    it('should not hide any ticket fields when multiline is true', async () => {
        render(<TicketFields {...defaultProps} isMultiline />)

        expect(await screen.findByText('Test Value')).toBeInTheDocument()
        expect(screen.queryByText('+1 more')).not.toBeInTheDocument()
    })

    it('should apply the correct classNames when isBold is true', async () => {
        render(<TicketFields {...defaultProps} isBold />)

        expect(await screen.findByText('Test Value')).toHaveClass('bold')
    })

    describe('conditional field visibility', () => {
        it('should hide fields when conditions evaluate to hidden', async () => {
            const conditionalField = {
                ...ticketInputFieldDefinition,
                required: false,
                requirement_type: RequirementType.Conditional,
            }
            mockFieldDefinitions([
                conditionalField,
                ticketNumberFieldDefinition,
            ])

            useCustomFieldsConditionsEvaluationResultsMock.mockReturnValue({
                evaluationResults: {},
                conditionsLoading: false,
            })

            render(<TicketFields {...defaultProps} />)

            expect(await screen.findByText('123')).toBeInTheDocument()
            expect(screen.queryByText('Test Value')).not.toBeInTheDocument()
        })

        it('should show fields when conditions evaluate to visible', async () => {
            const conditionalField = {
                ...ticketInputFieldDefinition,
                required: false,
                requirement_type: RequirementType.Conditional,
            }
            mockFieldDefinitions([
                conditionalField,
                ticketNumberFieldDefinition,
            ])

            useCustomFieldsConditionsEvaluationResultsMock.mockReturnValue({
                evaluationResults: {
                    [conditionalField.id]: ExpressionFieldType.Visible,
                    [ticketNumberFieldDefinition.id]:
                        ExpressionFieldType.Visible,
                },
                conditionsLoading: false,
            })

            render(<TicketFields {...defaultProps} />)

            expect(await screen.findByText('Test Value')).toBeInTheDocument()
            expect(screen.getByText('123')).toBeInTheDocument()
        })

        it('should show fields when they are required regardless of conditions', async () => {
            const requiredField = {
                ...ticketInputFieldDefinition,
                required: true,
                requirement_type: RequirementType.Required,
            }
            mockFieldDefinitions([requiredField, ticketNumberFieldDefinition])

            useCustomFieldsConditionsEvaluationResultsMock.mockReturnValue({
                evaluationResults: {},
                conditionsLoading: false,
            })

            render(<TicketFields {...defaultProps} />)

            expect(await screen.findByText('Test Value')).toBeInTheDocument()
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

        it('should filter out AI managed fields', async () => {
            const aiManagedField = {
                ...ticketInputFieldDefinition,
                id: 9999,
                managed_type: 'ai_intent',
            }
            mockFieldDefinitions([ticketInputFieldDefinition, aiManagedField])

            const fieldValues = {
                ...defaultProps.fieldValues,
                ['9999']: { value: 'AI Value' } as TicketCustomFieldValue,
            }

            render(<TicketFields {...defaultProps} fieldValues={fieldValues} />)

            expect(await screen.findByText('Test Value')).toBeInTheDocument()
            expect(screen.queryByText('AI Value')).not.toBeInTheDocument()
        })

        it('should handle conditional required fields', async () => {
            const conditionalRequiredField = {
                ...ticketInputFieldDefinition,
                required: false,
                requirement_type: RequirementType.Conditional,
            }
            mockFieldDefinitions([conditionalRequiredField])

            useCustomFieldsConditionsEvaluationResultsMock.mockReturnValue({
                evaluationResults: {
                    [conditionalRequiredField.id]: ExpressionFieldType.Required,
                },
                conditionsLoading: false,
            })

            render(<TicketFields {...defaultProps} />)

            expect(await screen.findByText('Test Value')).toBeInTheDocument()
        })
    })
})
