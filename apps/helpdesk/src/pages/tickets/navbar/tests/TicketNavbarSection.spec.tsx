import type { ComponentProps } from 'react'

import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { section } from 'fixtures/section'
import { user } from 'fixtures/users'
import { view } from 'fixtures/views'
import { ViewVisibility } from 'models/view/types'
import { SplitTicketViewProvider } from 'split-ticket-view-toggle'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'

import { TicketNavbarSectionBridgeContainer } from '../TicketNavbarSectionBridge'

// Captures the onDrop prop from the inner section-level View DropTarget (identified by
// accept='view' + bottomIndicatorClassName) so we can call it directly in tests.
let capturedSectionViewOnDrop:
    | ((item: any, monitor: any, direction: any) => any)
    | null = null
let capturedSectionCanDrop: ((item: any) => boolean) | null = null
let capturedSectionViewCanDrop: ((item: any) => boolean) | null = null
let capturedNestedViewCanDrop: ((item: any) => boolean) | null = null

// Mock TicketNavbarDropTarget for this test
jest.mock('../TicketNavbarDropTarget', () => ({
    __esModule: true,
    TicketNavbarDropTarget: ({
        accept,
        bottomIndicatorClassName,
        canDrop,
        children,
        className,
        onDrop,
    }: any) => {
        if (accept === 'section') {
            capturedSectionCanDrop = canDrop
        }
        if (accept === 'view' && bottomIndicatorClassName) {
            capturedSectionViewOnDrop = onDrop
            capturedSectionViewCanDrop = canDrop
        }
        if (Array.isArray(accept)) {
            capturedNestedViewCanDrop = canDrop
        }
        const dndAttributes = {
            accept,
            bottomindicatorclassname: bottomIndicatorClassName,
        }

        return (
            <div
                className={className}
                data-testid="ticket-navbar-drop-target"
                {...dndAttributes}
            >
                {children}
            </div>
        )
    },
}))

const minProps = {
    currentUser: fromJS(user),
    notify: jest.fn(),
    onSectionDeleteClick: jest.fn(),
    onSectionRenameClick: jest.fn(),
    sectionElement: {
        data: section,
        type: TicketNavbarElementType.Section,
        children: [view],
    },
    viewUpdated: jest.fn(),
    sections: {
        [section.id]: section,
    },
    views: {
        [view.id]: view,
    },
} as unknown as ComponentProps<typeof TicketNavbarSectionBridgeContainer>

describe('<TicketNavbarSectionBridge/>', () => {
    const renderSection = (
        props: Partial<
            ComponentProps<typeof TicketNavbarSectionBridgeContainer>
        > = {},
    ) =>
        render(
            <SplitTicketViewProvider>
                <TicketNavbarSectionBridgeContainer {...minProps} {...props} />
            </SplitTicketViewProvider>,
            {
                storeState: {
                    entities: fromJS({
                        sections: minProps.sections,
                        views: minProps.views,
                    }),
                    currentUser: fromJS(user),
                },
            },
        )

    beforeEach(() => {
        capturedSectionViewOnDrop = null
        capturedSectionCanDrop = null
        capturedSectionViewCanDrop = null
        capturedNestedViewCanDrop = null
    })

    it('renders section name and child views via NavigationSection', () => {
        renderSection()

        expect(
            screen.getByText(minProps.sectionElement.data.name),
        ).toBeInTheDocument()
        expect(
            screen.getByText(minProps.sectionElement.children[0].name),
        ).toBeInTheDocument()
    })

    it('displays the candu link for AI Agent', () => {
        const aiAgentSection = {
            ...minProps.sectionElement.data,
            decoration: {
                emoji: '✨',
            },
            name: 'AI Agent',
        }

        const { container } = renderSection({
            sectionElement: {
                ...minProps.sectionElement,
                data: aiAgentSection,
            },
        })

        expect(container.querySelector('[data-candu-id]')).toHaveAttribute(
            'data-candu-id',
            'ticket-navbar-ai-agent-section-link-ai-agent',
        )
    })

    it('renders emoji decoration', () => {
        renderSection({
            sectionElement: {
                ...minProps.sectionElement,
                data: {
                    ...minProps.sectionElement.data,
                    decoration: {
                        emoji: '🚀',
                    },
                },
            },
        })

        expect(screen.getByText('🚀')).toBeInTheDocument()
    })

    it('does not render a disclosure indicator for empty sections', () => {
        const { container } = renderSection({
            onSectionDeleteClick: undefined,
            onSectionRenameClick: undefined,
            sectionElement: {
                ...minProps.sectionElement,
                children: [],
            },
        })

        expect(container.querySelector('svg')).not.toBeInTheDocument()
    })

    it('renders Rename and Delete menu items when actions are provided', async () => {
        const sectionUser = userEvent.setup()
        const onSectionRenameClick = jest.fn()
        const onSectionDeleteClick = jest.fn()

        renderSection({ onSectionRenameClick, onSectionDeleteClick })

        await sectionUser.click(
            screen.getByRole('button', {
                name: 'dots-meatballs-horizontal',
            }),
        )

        await waitFor(() => {
            expect(screen.getByText('Rename')).toBeInTheDocument()
            expect(screen.getByText('Delete')).toBeInTheDocument()
        })
    })

    it('calls onSectionRenameClick when Rename is selected', async () => {
        const sectionUser = userEvent.setup()
        const onSectionRenameClick = jest.fn()

        renderSection({
            onSectionRenameClick,
            onSectionDeleteClick: jest.fn(),
        })

        await sectionUser.click(
            screen.getByRole('button', {
                name: 'dots-meatballs-horizontal',
            }),
        )

        await waitFor(() => {
            expect(screen.getByText('Rename')).toBeInTheDocument()
        })

        await sectionUser.click(screen.getByText('Rename'))

        expect(onSectionRenameClick).toHaveBeenCalledWith(
            minProps.sectionElement.data.id,
        )
    })

    it('calls onSectionDeleteClick when Delete is selected', async () => {
        const sectionUser = userEvent.setup()
        const onSectionDeleteClick = jest.fn()

        renderSection({
            onSectionRenameClick: jest.fn(),
            onSectionDeleteClick,
        })

        await sectionUser.click(
            screen.getByRole('button', {
                name: 'dots-meatballs-horizontal',
            }),
        )

        await waitFor(() => {
            expect(screen.getByText('Delete')).toBeInTheDocument()
        })

        await sectionUser.click(screen.getByText('Delete'))

        expect(onSectionDeleteClick).toHaveBeenCalledWith(
            minProps.sectionElement.data.id,
        )
    })

    it('uses provided view and section maps for drop eligibility', () => {
        const injectedSection = {
            ...section,
            id: 50,
            private: true,
        }
        const draggedSection = {
            ...section,
            id: 70,
            private: true,
        }
        const privateView = {
            ...view,
            id: 60,
            visibility: ViewVisibility.Private,
        }
        const publicView = {
            ...view,
            id: 61,
            visibility: ViewVisibility.Public,
        }

        renderSection({
            sectionElement: {
                children: [],
                data: injectedSection,
                type: TicketNavbarElementType.Section,
            },
            sections: {
                [draggedSection.id]: draggedSection,
            },
            views: {
                [privateView.id]: privateView,
                [publicView.id]: publicView,
            },
        })

        expect(
            capturedSectionCanDrop?.({
                id: draggedSection.id,
                type: TicketNavbarElementType.Section,
            }),
        ).toBe(true)
        expect(
            capturedSectionViewCanDrop?.({
                id: privateView.id,
                type: TicketNavbarElementType.View,
            }),
        ).toBe(true)
        expect(
            capturedSectionViewCanDrop?.({
                id: publicView.id,
                type: TicketNavbarElementType.View,
            }),
        ).toBe(false)
    })

    it('uses provided view and section maps for nested view drop eligibility', () => {
        const targetView = {
            ...view,
            id: 80,
            section_id: section.id,
            visibility: ViewVisibility.Private,
        }
        const draggedView = {
            ...view,
            id: 81,
            section_id: null,
            visibility: ViewVisibility.Private,
        }

        renderSection({
            sectionElement: {
                children: [targetView],
                data: {
                    ...section,
                    private: true,
                },
                type: TicketNavbarElementType.Section,
            },
            sections: {
                [section.id]: section,
            },
            views: {
                [draggedView.id]: draggedView,
                [targetView.id]: targetView,
            },
        })

        expect(
            capturedNestedViewCanDrop?.({
                id: draggedView.id,
                type: TicketNavbarElementType.View,
            }),
        ).toBe(true)
    })

    describe('handleViewDrop', () => {
        it('does not override the result when a child drop target already handled the drop', () => {
            renderSection()

            const result = capturedSectionViewOnDrop?.(
                { id: view.id, type: 'view' },
                { didDrop: () => true },
                'down',
            )

            expect(result).toBeUndefined()
        })

        it('returns the section drop result when no child target has handled the drop', () => {
            renderSection()

            const result = capturedSectionViewOnDrop?.(
                { id: view.id, type: 'view' },
                { didDrop: () => false },
                'down',
            )

            expect(result).toEqual({
                viewId: null,
                sectionId: section.id,
                direction: 'down',
            })
        })

        it('preserves the drop direction when returning section drop result', () => {
            renderSection()

            const result = capturedSectionViewOnDrop?.(
                { id: view.id, type: 'view' },
                { didDrop: () => false },
                'up',
            )

            expect(result).toEqual({
                viewId: null,
                sectionId: section.id,
                direction: 'up',
            })
        })
    })
})
