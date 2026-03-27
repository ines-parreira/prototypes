import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Segment } from 'AIJourney/pages/Segments/Segments'

import { SegmentsSidePanel } from './SegmentsSidePanel'

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
    id: 1,
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

            await user.click(screen.getByRole('button', { name: /cancel/i }))

            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })

    describe('Save segment button', () => {
        it('should call onClose when Save segment is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /save segment/i }),
            )

            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })

    describe('panel close (onOpenChange)', () => {
        it('should call onClose when the panel is closed externally', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /close panel/i }),
            )

            expect(onClose).toHaveBeenCalledTimes(1)
        })
    })
})
