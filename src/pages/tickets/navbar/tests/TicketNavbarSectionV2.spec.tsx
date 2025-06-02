import { ComponentProps } from 'react'

import { render, screen, within } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'

import { Navigation } from 'components/Navigation/Navigation'
import { section } from 'fixtures/section'
import { user } from 'fixtures/users'
import { view } from 'fixtures/views'
import { SplitTicketViewProvider } from 'split-ticket-view-toggle'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'
import { mockStore } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

import { TicketNavbarSectionContainerV2 } from '../v2/TicketNavbarSectionV2'

// Mock TicketNavbarDropTarget for this test
jest.mock('../TicketNavbarDropTarget', () => ({
    __esModule: true,
    default: ({ children, className, ...props }: any) => (
        <div
            className={className}
            data-testid="ticket-navbar-drop-target"
            {...props}
        >
            {children}
        </div>
    ),
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
    views: {
        [view.id]: view,
    },
    viewsCount: {
        7: 0,
    },
} as unknown as ComponentProps<typeof TicketNavbarSectionContainerV2>

describe('<TicketNavbarSectionV2/>', () => {
    it.each([
        ['views expanded', { value: [1] }],
        ['views collapsed', { value: [] }],
    ])('should render a section (%s)', (_, props) => {
        const { container } = render(
            <DndProvider backend={HTML5Backend}>
                <Provider
                    store={mockStore({
                        entities: fromJS({}),
                        currentUser: fromJS(user),
                    })}
                >
                    <MemoryRouter initialEntries={['/']}>
                        <SplitTicketViewProvider>
                            <Navigation.Root value={props.value}>
                                <TicketNavbarSectionContainerV2 {...minProps} />
                            </Navigation.Root>
                        </SplitTicketViewProvider>
                    </MemoryRouter>
                </Provider>
            </DndProvider>,
        )

        expect(
            screen.getByText(minProps.sectionElement.data.name),
        ).toBeInTheDocument()

        const { value } = props

        if (value.length > 0) {
            expect(
                within(container).getByText(
                    minProps.sectionElement.children[0].name,
                ),
            ).toBeInTheDocument()
        } else {
            expect(
                within(container).queryByText(
                    minProps.sectionElement.children[0].name,
                ),
            ).not.toBeInTheDocument()
        }
    })

    it('should display the candu link for AI Agent', () => {
        const section = {
            ...minProps.sectionElement.data,
            decoration: {
                emoji: '✨',
            },
            name: 'AI Agent',
        }

        const { container } = render(
            <DndProvider backend={HTML5Backend}>
                <Navigation.Root>
                    <TicketNavbarSectionContainerV2
                        {...minProps}
                        sectionElement={{
                            ...minProps.sectionElement,
                            data: section,
                        }}
                    />
                </Navigation.Root>
            </DndProvider>,
        )

        const element = container.querySelector('[data-candu-id]')

        // Assert that the element exists and has the correct value
        expect(element).toBeInTheDocument()
        expect(element).toHaveAttribute(
            'data-candu-id',
            'ticket-navbar-ai-agent-section-link-ai-agent',
        )
    })

    it('should have the correct component structure', () => {
        const { container } = render(
            <DndProvider backend={HTML5Backend}>
                <Provider
                    store={mockStore({
                        entities: fromJS({}),
                        currentUser: fromJS(user),
                    })}
                >
                    <MemoryRouter initialEntries={['/']}>
                        <SplitTicketViewProvider>
                            <Navigation.Root>
                                <TicketNavbarSectionContainerV2 {...minProps} />
                            </Navigation.Root>
                        </SplitTicketViewProvider>
                    </MemoryRouter>
                </Provider>
            </DndProvider>,
        )

        // Verify the outer DnD target structure
        const outerDndTarget = container.firstChild as HTMLElement
        expect(outerDndTarget).toHaveClass('root')
        expect(outerDndTarget.firstChild).toHaveAttribute(
            'data-testid',
            'ticket-navbar-drop-target',
        )

        // Verify the Navigation.Section structure
        const navigationSection = outerDndTarget.firstChild as HTMLElement
        expect(navigationSection).toHaveClass('section section')

        // Verify the inner DnD target for views
        const innerDndTarget = navigationSection.firstChild as HTMLElement
        expect(innerDndTarget).toHaveAttribute(
            'data-testid',
            'ticket-navbar-drop-target',
        )
        expect(innerDndTarget).toHaveAttribute('accept', 'view')
        expect(innerDndTarget).toHaveAttribute(
            'bottomindicatorclassname',
            'viewIntoSectionIndicator',
        )

        // Verify the section trigger container
        const triggerContainer = innerDndTarget.firstChild as HTMLElement
        expect(triggerContainer).toHaveClass('navbarSectionTriggerContainer')
        expect(triggerContainer).toHaveAttribute('draggable', 'true')
    })
})
