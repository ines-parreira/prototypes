import type { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import type { Segment } from 'AIJourney/pages/Segments/Segments'
import { useJourneyContext } from 'AIJourney/providers'
import { useCreateSegment } from 'AIJourney/queries'
import { useAudienceCount } from 'AIJourney/queries/useAudienceCount/useAudienceCount'
import { useConditionsMetadata } from 'AIJourney/queries/useConditionsMetadata/useConditionsMetadata'
import { useUpdateSegment } from 'AIJourney/queries/useUpdateSegment/useUpdateSegment'
import type { ConditionsSchema } from 'AIJourney/types/conditionField'

import { SegmentsSidePanel } from './SegmentsSidePanel'

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/queries/useAudienceCount/useAudienceCount', () => ({
    useAudienceCount: jest.fn(),
}))

jest.mock('AIJourney/queries/useUpdateSegment/useUpdateSegment', () => ({
    useUpdateSegment: jest.fn(),
}))

jest.mock(
    'AIJourney/queries/useConditionsMetadata/useConditionsMetadata',
    () => ({
        useConditionsMetadata: jest.fn(),
    }),
)

jest.mock(
    'AIJourney/components/AudienceConditionField/AudienceConditionField',
    () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useFieldArray, useFormContext } = require('@repo/forms')
        return {
            AudienceConditionField: () => {
                const { fields, remove } = useFieldArray({ name: 'conditions' })
                const { setValue } = useFormContext()
                return (
                    <div>
                        conditions-section
                        {fields.map((_: unknown, index: number) => (
                            <button key={index} onClick={() => remove(index)}>
                                Remove condition
                            </button>
                        ))}
                        <button
                            onClick={() =>
                                setValue('conditions', [
                                    {
                                        object: 'shopper',
                                        field: 'lifetime_value',
                                        isAggregate: false,
                                        operator: 'gt',
                                        value: 1000,
                                        whereClause: null,
                                        purchaseDateClause: null,
                                    },
                                ])
                            }
                        >
                            Set valid condition
                        </button>
                        <button
                            onClick={() =>
                                setValue('conditions', [
                                    {
                                        object: 'shopper',
                                        field: 'lifetime_value',
                                        isAggregate: false,
                                        operator: 'gt',
                                        value: 1000,
                                        isWhereVisible: true,
                                        whereClause: {
                                            field: 'lifetime_value',
                                            operator: 'eq',
                                            value: null,
                                        },
                                        purchaseDateClause: null,
                                    },
                                ])
                            }
                        >
                            Set visible whereClause with null value
                        </button>
                        <button
                            onClick={() =>
                                setValue('conditions', [
                                    {
                                        object: 'shopper',
                                        field: 'lifetime_value',
                                        isAggregate: false,
                                        operator: 'gt',
                                        value: 1000,
                                        isWhereVisible: true,
                                        whereClause: {
                                            field: 'lifetime_value',
                                            operator: 'eq',
                                            value: '',
                                        },
                                        purchaseDateClause: null,
                                    },
                                ])
                            }
                        >
                            Set visible whereClause with empty string value
                        </button>
                        <button
                            onClick={() =>
                                setValue('conditions', [
                                    {
                                        object: 'shopper',
                                        field: 'lifetime_value',
                                        isAggregate: false,
                                        operator: 'gt',
                                        value: 1000,
                                        isWhereVisible: true,
                                        whereClause: {
                                            field: 'lifetime_value',
                                            operator: 'eq',
                                            value: [],
                                        },
                                        purchaseDateClause: null,
                                    },
                                ])
                            }
                        >
                            Set visible whereClause with empty array value
                        </button>
                        <button
                            onClick={() =>
                                setValue('conditions', [
                                    {
                                        object: 'shopper',
                                        field: 'lifetime_value',
                                        isAggregate: false,
                                        operator: 'gt',
                                        value: 1000,
                                        isWhereVisible: true,
                                        whereClause: {
                                            field: 'lifetime_value',
                                            operator: 'eq',
                                            value: ' , ',
                                        },
                                        purchaseDateClause: null,
                                    },
                                ])
                            }
                        >
                            Set visible whereClause with whitespace value
                        </button>
                        <button
                            onClick={() =>
                                setValue('conditions', [
                                    {
                                        object: 'shopper',
                                        field: 'lifetime_value',
                                        isAggregate: false,
                                        operator: 'gt',
                                        value: 1000,
                                        isWhereVisible: true,
                                        whereClause: {
                                            field: 'lifetime_value',
                                            operator: 'eq',
                                            value: 'valid-value',
                                        },
                                        purchaseDateClause: null,
                                    },
                                ])
                            }
                        >
                            Set visible whereClause with valid value
                        </button>
                        <button
                            onClick={() =>
                                setValue('conditions', [
                                    {
                                        object: 'shopper',
                                        field: 'lifetime_value',
                                        isAggregate: false,
                                        operator: 'gt',
                                        value: 1000,
                                        isWhereVisible: true,
                                        whereClause: {
                                            field: 'lifetime_value',
                                            operator: 'isEmpty',
                                            value: null,
                                        },
                                        purchaseDateClause: null,
                                    },
                                ])
                            }
                        >
                            Set visible whereClause with unary operator
                        </button>
                        <button
                            onClick={() =>
                                setValue('conditions', [
                                    {
                                        object: 'shopper',
                                        field: 'lifetime_value',
                                        isAggregate: false,
                                        operator: 'gt',
                                        value: 1000,
                                        isWhereVisible: false,
                                        whereClause: {
                                            field: 'lifetime_value',
                                            operator: 'eq',
                                            value: null,
                                        },
                                        purchaseDateClause: null,
                                    },
                                ])
                            }
                        >
                            Set hidden whereClause with null value
                        </button>
                    </div>
                )
            },
        }
    },
)

jest.mock(
    'AIJourney/components/SegmentCountPreview/SegmentCountPreview',
    () => ({
        SegmentCountPreview: () => <div>segment-count-preview</div>,
    }),
)

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
jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/queries', () => ({
    useCreateSegment: jest.fn(),
}))

type MockSidePanelProps = {
    children: ReactNode
    isOpen: boolean
    onOpenChange: () => void
}

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    SidePanel: ({ children, isOpen, onOpenChange }: MockSidePanelProps) =>
        isOpen ? (
            <div>
                <button onClick={onOpenChange}>Close panel</button>
                {children}
            </div>
        ) : null,
}))

const mockSegment: Segment = {
    id: '1',
    name: 'Support small business',
    conditions: 'gt(shopper.lifetime_value, 1000)',
    count: 100,
    created_datetime: '2026-01-15T00:00:00',
    updated_datetime: '2026-09-12T00:00:00',
}

const mockUseUpdateSegment = assumeMock(useUpdateSegment)
const mockUseAudienceCount = assumeMock(useAudienceCount)
const onClose = jest.fn()
const mockMutateAsync = jest.fn()

const mockUseConditionsMetadata = useConditionsMetadata as jest.Mock
const mockUseJourneyContext = useJourneyContext as jest.Mock
const mockUseCreateSegment = useCreateSegment as jest.Mock

const renderComponent = (
    props: Partial<Parameters<typeof SegmentsSidePanel>[0]> = {},
) =>
    render(
        <SegmentsSidePanel
            isOpen={true}
            onClose={onClose}
            schema={mockSchema}
            {...props}
        />,
    )

describe('<SegmentsSidePanel />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        assumeMock(useConditionsMetadata).mockReturnValue({
            data: undefined,
        } as unknown as ReturnType<typeof useConditionsMetadata>)
        mockUseConditionsMetadata.mockReturnValue({ data: undefined })
        mockUseCreateSegment.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
        })
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: { id: 123 },
        } as unknown as ReturnType<typeof useJourneyContext>)
        mockUseAudienceCount.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as unknown as ReturnType<typeof useAudienceCount>)

        mockMutateAsync.mockResolvedValue(undefined)
        mockUseUpdateSegment.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
        } as unknown as ReturnType<typeof useUpdateSegment>)
        mockMutateAsync.mockResolvedValue({})
    })

    describe('create mode (no segment)', () => {
        it('should render "Create new segment" heading', () => {
            renderComponent()

            expect(
                screen.getByRole('heading', { name: 'Create new segment' }),
            ).toBeInTheDocument()
        })

        it('should render Segment name field with empty value', () => {
            renderComponent()

            expect(screen.getByLabelText(/segment name/i)).toHaveValue('')
        })

        it('should allow typing in the segment name field', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.type(
                    screen.getByLabelText(/segment name/i),
                    'My new segment',
                )
            })

            expect(screen.getByLabelText(/segment name/i)).toHaveValue(
                'My new segment',
            )
        })
    })

    describe('edit mode (with segment)', () => {
        it('should render "Edit segment" heading', () => {
            renderComponent({ segment: mockSegment })

            expect(
                screen.getByRole('heading', { name: 'Edit segment' }),
            ).toBeInTheDocument()
        })

        it('should render Segment name field pre-filled with segment name', () => {
            renderComponent({ segment: mockSegment })

            expect(screen.getByLabelText(/segment name/i)).toHaveValue(
                'Support small business',
            )
        })
    })

    describe('when isOpen is false', () => {
        it('should not render panel content', () => {
            renderComponent({ isOpen: false })

            expect(
                screen.queryByRole('heading', { name: /segment/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('Cancel button', () => {
        it('should call onClose when Cancel is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /cancel/i }),
                )
            })
            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('should reset the form when Cancel is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.type(
                    screen.getByLabelText(/segment name/i),
                    'My segment',
                )
            })
            expect(screen.getByLabelText(/segment name/i)).toHaveValue(
                'My segment',
            )

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /cancel/i }),
                )
            })
            expect(screen.getByLabelText(/segment name/i)).toHaveValue('')
        })
    })

    describe('Save segment button', () => {
        it('should be disabled when isLoading is true', () => {
            mockUseCreateSegment.mockReturnValue({
                mutateAsync: mockMutateAsync,
                isLoading: true,
            })
            renderComponent()

            expect(
                screen.getByRole('button', { name: /save segment/i }),
            ).toBeDisabled()
        })

        it('should call createSegment with the segment name, built conditions, and integration id', async () => {
            mockUseConditionsMetadata.mockReturnValue({ data: mockSchema })
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', {
                        name: /set valid condition/i,
                    }),
                )
                await user.type(
                    screen.getByLabelText(/segment name/i),
                    'My Segment',
                )
                await user.click(
                    screen.getByRole('button', { name: /save segment/i }),
                )
            })

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    name: 'My Segment',
                    conditions: 'gt(shopper.lifetime_value, 1000)',
                    integration_id: 123,
                })
            })
        })

        expect(mockMutateAsync).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()
    })

    it('should call updateSegment with correct args in edit mode when schema is available', async () => {
        assumeMock(useConditionsMetadata).mockReturnValue({
            data: mockSchema,
        } as unknown as ReturnType<typeof useConditionsMetadata>)
        const user = userEvent.setup()
        renderComponent({ segment: mockSegment })

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /save segment/i }),
            )
        })

        expect(mockMutateAsync).toHaveBeenCalledWith({
            segmentId: mockSegment.id,
            updateSegmentRequest: {
                name: mockSegment.name,
                conditions: 'gt(shopper.lifetime_value, 1000)',
            },
        })
    })

    it('should call onClose after successful update in edit mode', async () => {
        assumeMock(useConditionsMetadata).mockReturnValue({
            data: mockSchema,
        } as unknown as ReturnType<typeof useConditionsMetadata>)
        const user = userEvent.setup()
        renderComponent({ segment: mockSegment })

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /save segment/i }),
            )
        })

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should call onClose after successful creation', async () => {
        mockUseConditionsMetadata.mockReturnValue({ data: mockSchema })
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /set valid condition/i }),
            )
            await user.type(
                screen.getByLabelText(/segment name/i),
                'My Segment',
            )
            await user.click(
                screen.getByRole('button', { name: /save segment/i }),
            )
        })

        await waitFor(() => {
            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })

    it('should not close the panel when creation fails', async () => {
        mockUseConditionsMetadata.mockReturnValue({ data: mockSchema })
        mockMutateAsync.mockRejectedValue(new Error('Network error'))
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /set valid condition/i }),
            )
            await user.type(
                screen.getByLabelText(/segment name/i),
                'My Segment',
            )
            await user.click(
                screen.getByRole('button', { name: /save segment/i }),
            )
        })

        await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalled()
        })
        expect(onClose).not.toHaveBeenCalled()
    })

    it('should not call createSegment when currentIntegration is undefined', async () => {
        mockUseConditionsMetadata.mockReturnValue({ data: mockSchema })
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: undefined,
        })
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.type(
                screen.getByLabelText(/segment name/i),
                'My Segment',
            )
            await user.click(
                screen.getByRole('button', { name: /save segment/i }),
            )
        })

        expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('should be disabled when only the name is filled and conditions are in the default empty state', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.type(
                screen.getByLabelText(/segment name/i),
                'My segment',
            )
        })

        expect(
            screen.getByRole('button', { name: /save segment/i }),
        ).toBeDisabled()
    })

    it('should be disabled when a condition has a non-unary operator but no value', async () => {
        const user = userEvent.setup()

        const incompleteSegment = {
            ...mockSegment,
            conditions: 'eq(shopper.lifetime_value, )',
        }
        renderComponent({ segment: incompleteSegment })
        await act(async () => {
            await user.type(
                screen.getByLabelText(/segment name/i),
                'My Segment',
            )
            await user.click(
                screen.getByRole('button', { name: /save segment/i }),
            )
        })

        expect(mockMutateAsync).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()
    })

    it('should not call createSegment when currentIntegration is undefined', async () => {
        mockUseConditionsMetadata.mockReturnValue({ data: mockSchema })
        mockUseJourneyContext.mockReturnValue({
            currentIntegration: undefined,
        })
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.type(
                screen.getByLabelText(/segment name/i),
                'My Segment',
            )
            await user.click(
                screen.getByRole('button', { name: /save segment/i }),
            )
        })

        expect(mockMutateAsync).not.toHaveBeenCalled()
    })

    it('should be disabled when only the name is filled and conditions are in the default empty state', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await act(async () => {
                await user.type(
                    screen.getByLabelText(/segment name/i),
                    'My segment',
                )
            })
        })

        expect(
            screen.getByRole('button', { name: /save segment/i }),
        ).toBeDisabled()
    })

    it('should be disabled when a condition has a non-unary operator but no value', async () => {
        const incompleteSegment = {
            ...mockSegment,
            conditions: 'eq(shopper.lifetime_value, )',
        }
        renderComponent({ segment: incompleteSegment })

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save segment/i }),
            ).toBeDisabled()
        })
    })

    it('should be disabled when the segment name is empty', async () => {
        renderComponent()

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save segment/i }),
            ).toBeDisabled()
        })
    })

    it('should be disabled when the segment name is empty', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /save segment/i }),
        ).toBeDisabled()
    })

    it('should be disabled when only the segment name is filled and no conditions are set', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.type(
                screen.getByLabelText(/segment name/i),
                'My segment',
            )
        })

        expect(
            screen.getByRole('button', { name: /save segment/i }),
        ).toBeDisabled()
    })

    it('should be disabled when all conditions are removed', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /remove condition/i }),
            )
        })

        expect(
            screen.getByRole('button', { name: /save segment/i }),
        ).toBeDisabled()
    })

    it('should be enabled when all conditions have valid values', async () => {
        renderComponent({ segment: mockSegment })

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /save segment/i }),
            ).not.toBeDisabled()
        })
    })

    it('should disable Save button while update is pending', () => {
        mockUseUpdateSegment.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: true,
        } as unknown as ReturnType<typeof useUpdateSegment>)
        renderComponent({ segment: mockSegment })

        expect(
            screen.getByRole('button', { name: /save segment/i }),
        ).toBeDisabled()
    })

    describe('panel close (onOpenChange)', () => {
        it('should call onClose when the panel is closed externally', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /close panel/i }),
                )
            })

            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })

    describe('conditions section', () => {
        it('should render AudienceConditionField', () => {
            assumeMock(useConditionsMetadata).mockReturnValue({
                data: mockSchema,
            } as unknown as ReturnType<typeof useConditionsMetadata>)
            renderComponent()

            expect(screen.getByText('conditions-section')).toBeInTheDocument()
        })
    })

    describe('audience count query', () => {
        it('should call useAudienceCount with enabled=false when conditions are empty', () => {
            renderComponent()

            expect(mockUseAudienceCount).toHaveBeenCalledWith(
                expect.objectContaining({ conditions: '' }),
                expect.objectContaining({ enabled: false }),
            )
        })

        it('should call useAudienceCount with the current integration id', () => {
            mockUseJourneyContext.mockReturnValue({
                currentIntegration: { id: 42 },
            } as unknown as ReturnType<typeof useJourneyContext>)

            renderComponent()

            expect(mockUseAudienceCount).toHaveBeenCalledWith(
                expect.objectContaining({ integration_id: 42 }),
                expect.any(Object),
            )
        })
    })

    describe('whereClause validation', () => {
        const setupWithConditionAndName = async (
            user: ReturnType<typeof userEvent.setup>,
            conditionButtonLabel: RegExp,
        ) => {
            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: conditionButtonLabel }),
                )
                await user.type(
                    screen.getByLabelText(/segment name/i),
                    'My Segment',
                )
            })
        }

        it('should disable Save when isWhereVisible is true and whereClause value is null', async () => {
            const user = userEvent.setup()
            renderComponent()

            await setupWithConditionAndName(
                user,
                /set visible whereClause with null value/i,
            )

            expect(
                screen.getByRole('button', { name: /save segment/i }),
            ).toBeDisabled()
        })

        it('should disable Save when isWhereVisible is true and whereClause value is an empty string', async () => {
            const user = userEvent.setup()
            renderComponent()

            await setupWithConditionAndName(
                user,
                /set visible whereClause with empty string value/i,
            )

            expect(
                screen.getByRole('button', { name: /save segment/i }),
            ).toBeDisabled()
        })

        it('should disable Save when isWhereVisible is true and whereClause value is an empty array', async () => {
            const user = userEvent.setup()
            renderComponent()

            await setupWithConditionAndName(
                user,
                /set visible whereClause with empty array value/i,
            )

            expect(
                screen.getByRole('button', { name: /save segment/i }),
            ).toBeDisabled()
        })

        it('should disable Save when isWhereVisible is true and whereClause value is whitespace-only', async () => {
            const user = userEvent.setup()
            renderComponent()

            await setupWithConditionAndName(
                user,
                /set visible whereClause with whitespace value/i,
            )

            expect(
                screen.getByRole('button', { name: /save segment/i }),
            ).toBeDisabled()
        })

        it('should enable Save when isWhereVisible is true and whereClause has a valid value', async () => {
            const user = userEvent.setup()
            renderComponent()

            await setupWithConditionAndName(
                user,
                /set visible whereClause with valid value/i,
            )

            expect(
                screen.getByRole('button', { name: /save segment/i }),
            ).not.toBeDisabled()
        })

        it('should enable Save when isWhereVisible is true and whereClause uses a unary operator', async () => {
            const user = userEvent.setup()
            renderComponent()

            await setupWithConditionAndName(
                user,
                /set visible whereClause with unary operator/i,
            )

            expect(
                screen.getByRole('button', { name: /save segment/i }),
            ).not.toBeDisabled()
        })

        it('should enable Save when isWhereVisible is false even if whereClause value is null', async () => {
            const user = userEvent.setup()
            renderComponent()

            await setupWithConditionAndName(
                user,
                /set hidden whereClause with null value/i,
            )

            expect(
                screen.getByRole('button', { name: /save segment/i }),
            ).not.toBeDisabled()
        })
    })
})
