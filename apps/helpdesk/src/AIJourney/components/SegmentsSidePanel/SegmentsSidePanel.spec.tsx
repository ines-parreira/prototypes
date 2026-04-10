import type { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import type { Segment } from 'AIJourney/pages/Segments/Segments'
import { useConditionsMetadata } from 'AIJourney/queries/useConditionsMetadata/useConditionsMetadata'
import type { ConditionsSchema } from 'AIJourney/types/conditionField'

import { SegmentsSidePanel } from './SegmentsSidePanel'

jest.mock(
    'AIJourney/queries/useConditionsMetadata/useConditionsMetadata',
    () => ({
        useConditionsMetadata: jest.fn().mockReturnValue({ data: undefined }),
    }),
)

jest.mock(
    'AIJourney/components/AudienceConditionField/AudienceConditionField',
    () => ({
        AudienceConditionField: () => <div>conditions-section</div>,
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

const onClose = jest.fn()

const renderComponent = (
    props: Partial<Parameters<typeof SegmentsSidePanel>[0]> = {},
) => render(<SegmentsSidePanel isOpen={true} onClose={onClose} {...props} />)

describe('<SegmentsSidePanel />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        assumeMock(useConditionsMetadata).mockReturnValue({
            data: undefined,
        } as unknown as ReturnType<typeof useConditionsMetadata>)
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
        it('should call onClose when Save segment is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await act(async () => {
                await user.click(
                    screen.getByRole('button', { name: /save segment/i }),
                )
            })

            expect(onClose).toHaveBeenCalledTimes(1)
        })
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
        it('should render AudienceConditionField when schema is available', () => {
            assumeMock(useConditionsMetadata).mockReturnValue({
                data: mockSchema,
            } as unknown as ReturnType<typeof useConditionsMetadata>)
            renderComponent()

            expect(screen.getByText('conditions-section')).toBeInTheDocument()
        })

        it('should not render AudienceConditionField when schema is not available', () => {
            renderComponent()

            expect(
                screen.queryByText('conditions-section'),
            ).not.toBeInTheDocument()
        })
    })
})
