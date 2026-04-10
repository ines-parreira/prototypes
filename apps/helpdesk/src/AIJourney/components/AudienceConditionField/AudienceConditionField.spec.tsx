import { useFieldArray } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ConditionsSchema } from '../../types/conditionField'
import { DEFAULT_CONDITION } from '../../types/conditionField'
import { AudienceConditionField } from './AudienceConditionField'

const capturedOnRemove: Array<() => void> = []

jest.mock('@repo/forms', () => ({
    ...jest.requireActual('@repo/forms'),
    useFieldArray: jest.fn(),
}))

jest.mock('../ConditionRow/ConditionRow', () => ({
    ConditionRow: ({
        index,
        onRemove,
    }: {
        index: number
        onRemove: () => void
    }) => {
        capturedOnRemove[index] = onRemove
        return <div>condition-row-{index}</div>
    },
}))

const mockAppend = jest.fn()
const mockRemove = jest.fn()
const useFieldArrayMock = assumeMock(useFieldArray)

const mockSchema: ConditionsSchema = {
    operators: {
        comparison: ['eq', 'neq'],
        set: ['containsAny'],
        unary: ['isEmpty'],
    },
    objects: {
        shopper: {
            fields: {
                lifetime_value: { type: 'number', operators: ['gt'] },
            },
        },
    },
}

const renderComponent = () =>
    render(<AudienceConditionField schema={mockSchema} />)

describe('<AudienceConditionField />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        capturedOnRemove.length = 0
        useFieldArrayMock.mockReturnValue({
            fields: [{ id: 'field-0' }],
            append: mockAppend,
            remove: mockRemove,
        } as unknown as ReturnType<typeof useFieldArrayMock>)
    })

    describe('static content', () => {
        it('should render the "Conditions" label', () => {
            renderComponent()

            expect(screen.getByText('Conditions')).toBeInTheDocument()
        })

        it('should render the required asterisk', () => {
            renderComponent()

            expect(screen.getByText('*')).toBeInTheDocument()
        })

        it('should render the description text', () => {
            renderComponent()

            expect(
                screen.getByText(/Define eligibility criteria/),
            ).toBeInTheDocument()
        })

        it('should render the "Add condition" button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /add condition/i }),
            ).toBeInTheDocument()
        })
    })

    describe('condition rows', () => {
        it('should render one ConditionRow when there is one field', () => {
            renderComponent()

            expect(screen.getByText('condition-row-0')).toBeInTheDocument()
        })

        it('should not render the AND pill for the first condition', () => {
            renderComponent()

            expect(screen.queryByText('AND')).not.toBeInTheDocument()
        })

        it('should render two ConditionRows and an AND pill when there are two fields', () => {
            useFieldArrayMock.mockReturnValue({
                fields: [{ id: 'field-0' }, { id: 'field-1' }],
                append: mockAppend,
                remove: mockRemove,
            } as unknown as ReturnType<typeof useFieldArrayMock>)
            renderComponent()

            expect(screen.getByText('condition-row-0')).toBeInTheDocument()
            expect(screen.getByText('condition-row-1')).toBeInTheDocument()
            expect(screen.getByText('AND')).toBeInTheDocument()
        })
    })

    describe('"Add condition" button', () => {
        it('should call append with DEFAULT_CONDITION when clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /add condition/i }),
            )

            expect(mockAppend).toHaveBeenCalledWith(DEFAULT_CONDITION)
        })
    })

    describe('remove condition', () => {
        it('should call remove with 0 when onRemove is triggered for the first row', () => {
            renderComponent()

            act(() => {
                capturedOnRemove[0]()
            })

            expect(mockRemove).toHaveBeenCalledWith(0)
        })

        it('should call remove with the correct index when onRemove is triggered for a later row', () => {
            useFieldArrayMock.mockReturnValue({
                fields: [{ id: 'field-0' }, { id: 'field-1' }],
                append: mockAppend,
                remove: mockRemove,
            } as unknown as ReturnType<typeof useFieldArrayMock>)
            renderComponent()

            act(() => {
                capturedOnRemove[1]()
            })

            expect(mockRemove).toHaveBeenCalledWith(1)
        })
    })
})
