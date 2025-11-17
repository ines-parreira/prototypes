import type { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { Navigation } from 'components/Navigation/Navigation'
import { section } from 'fixtures/section'
import { user } from 'fixtures/users'
import { view } from 'fixtures/views'
import { SplitTicketViewProvider } from 'split-ticket-view-toggle'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'
import { mockStore } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

import type { TicketNavbarElement } from '../TicketNavbarContent'
import {
    getNextSettings,
    TicketNavbarContentContainer,
} from '../TicketNavbarContent'
import { TicketNavbarDropDirection } from '../TicketNavbarDropTarget'

describe('<TicketNavbarContent/>', () => {
    const minProps = {
        elements: [
            {
                data: { ...section, id: 7 },
                type: TicketNavbarElementType.Section,
                children: [],
            },
            {
                data: { ...view, id: 10, name: 'Test View 10' },
                type: TicketNavbarElementType.View,
            },
        ] as TicketNavbarElement[],
        onClickDeleteSection: null,
        onClickRenameSection: null,
        currentUser: fromJS(user),
        views: {
            [view.id]: { ...view, section_id: 4 },
            10: { ...view, id: 10, name: 'Test View 10', section_id: null },
        },
        notify: jest.fn(),
        viewUpdated: jest.fn(),
        isPrivate: true,
        viewsCount: {
            7: 0,
            10: 1,
        },
    } as unknown as ComponentProps<typeof TicketNavbarContentContainer>

    beforeEach(() => {
        localStorage.removeItem('collapsed-view-sections')
    })

    afterAll(() => {
        global.localStorage.removeItem('collapsed-view-sections')
    })

    describe('rendering', () => {
        it('should render sections and views', () => {
            const { getByText } = render(
                <DndProvider backend={HTML5Backend}>
                    <MemoryRouter initialEntries={['/']}>
                        <Provider
                            store={mockStore({
                                entities: fromJS({}),
                                currentUser: fromJS(user),
                            })}
                        >
                            <SplitTicketViewProvider>
                                <Navigation.Root>
                                    <TicketNavbarContentContainer
                                        {...minProps}
                                    />
                                </Navigation.Root>
                            </SplitTicketViewProvider>
                        </Provider>
                    </MemoryRouter>
                </DndProvider>,
            )

            expect(
                getByText(minProps.elements[0].data.name),
            ).toBeInTheDocument()
            expect(
                getByText(minProps.elements[1].data.name),
            ).toBeInTheDocument()
        })
    })

    describe('getNextSettings', () => {
        const views = {
            1: { ...view, id: 1 },
            2: { ...view, id: 2 },
            3: { ...view, id: 3, section_id: 1 },
            4: { ...view, id: 4, section_id: 1 },
            5: { ...view, id: 5, section_id: 1 },
            6: { ...view, id: 6, section_id: 2 },
        }
        const sections = {
            1: { ...section, id: 1 },
            2: { ...section, id: 2 },
        }
        const orderedElements: TicketNavbarElement[] = [
            {
                data: views[1],
                type: TicketNavbarElementType.View,
            },
            {
                data: views[2],
                type: TicketNavbarElementType.View,
            },
            {
                children: [views[3], views[4], views[5]],
                data: sections[1],
                type: TicketNavbarElementType.Section,
            },
            {
                children: [views[6]],
                data: sections[2],
                type: TicketNavbarElementType.Section,
            },
        ]

        it('should move a root view to a root view', () => {
            const nextOrderedSettings = getNextSettings(
                { id: 1, type: TicketNavbarElementType.View },
                {
                    viewId: 2,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections,
            )
            expect(nextOrderedSettings.views[2].display_order).toBe(0)
            expect(nextOrderedSettings.views[1].display_order).toBe(1)
            expect(nextOrderedSettings.view_sections[1].display_order).toBe(2)
            expect(nextOrderedSettings.views[3].display_order).toBe(3)
            expect(nextOrderedSettings.views[4].display_order).toBe(4)
            expect(nextOrderedSettings.views[5].display_order).toBe(5)
            expect(nextOrderedSettings.view_sections[2].display_order).toBe(6)
            expect(nextOrderedSettings.views[6].display_order).toBe(7)
        })

        it('should move a root view to a section view', () => {
            const nextOrderedSettings = getNextSettings(
                { id: 1, type: TicketNavbarElementType.View },
                {
                    viewId: 3,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: 1,
                },
                orderedElements,
                views,
                sections,
            )

            expect(nextOrderedSettings.views[2].display_order).toBe(0)
            expect(nextOrderedSettings.view_sections[1].display_order).toBe(1)
            expect(nextOrderedSettings.views[3].display_order).toBe(2)
            expect(nextOrderedSettings.views[1].display_order).toBe(3)
            expect(nextOrderedSettings.views[4].display_order).toBe(4)
            expect(nextOrderedSettings.views[5].display_order).toBe(5)
            expect(nextOrderedSettings.view_sections[2].display_order).toBe(6)
            expect(nextOrderedSettings.views[6].display_order).toBe(7)
        })

        it('should move a section view to a root view', () => {
            const nextOrderedSettings = getNextSettings(
                { id: 4, type: TicketNavbarElementType.View },
                {
                    viewId: 2,
                    direction: TicketNavbarDropDirection.Up,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections,
            )

            expect(nextOrderedSettings.views[1].display_order).toBe(0)
            expect(nextOrderedSettings.views[4].display_order).toBe(1)
            expect(nextOrderedSettings.views[2].display_order).toBe(2)
            expect(nextOrderedSettings.view_sections[1].display_order).toBe(3)
            expect(nextOrderedSettings.views[3].display_order).toBe(4)
            expect(nextOrderedSettings.views[5].display_order).toBe(5)
            expect(nextOrderedSettings.view_sections[2].display_order).toBe(6)
            expect(nextOrderedSettings.views[6].display_order).toBe(7)
        })

        it('should move a section view to a section view', () => {
            const nextOrderedSettings = getNextSettings(
                { id: 3, type: TicketNavbarElementType.View },
                {
                    viewId: 4,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: 1,
                },
                orderedElements,
                views,
                sections,
            )

            expect(nextOrderedSettings.views[1].display_order).toBe(0)
            expect(nextOrderedSettings.views[2].display_order).toBe(1)
            expect(nextOrderedSettings.view_sections[1].display_order).toBe(2)
            expect(nextOrderedSettings.views[4].display_order).toBe(3)
            expect(nextOrderedSettings.views[3].display_order).toBe(4)
            expect(nextOrderedSettings.views[5].display_order).toBe(5)
            expect(nextOrderedSettings.view_sections[2].display_order).toBe(6)
            expect(nextOrderedSettings.views[6].display_order).toBe(7)
        })

        it('should move a view to top content boundary', () => {
            const nextOrderedSettings = getNextSettings(
                { id: 2, type: TicketNavbarElementType.View },
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Up,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections,
            )

            expect(nextOrderedSettings.views[2].display_order).toBe(0)
            expect(nextOrderedSettings.views[1].display_order).toBe(1)
            expect(nextOrderedSettings.view_sections[1].display_order).toBe(2)
            expect(nextOrderedSettings.views[3].display_order).toBe(3)
            expect(nextOrderedSettings.views[4].display_order).toBe(4)
            expect(nextOrderedSettings.views[5].display_order).toBe(5)
            expect(nextOrderedSettings.view_sections[2].display_order).toBe(6)
            expect(nextOrderedSettings.views[6].display_order).toBe(7)
        })

        it('should move a view to bottom content boundary', () => {
            const nextOrderedSettings = getNextSettings(
                { id: 2, type: TicketNavbarElementType.View },
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections,
            )

            expect(nextOrderedSettings.views[1].display_order).toBe(0)
            expect(nextOrderedSettings.view_sections[1].display_order).toBe(1)
            expect(nextOrderedSettings.views[3].display_order).toBe(2)
            expect(nextOrderedSettings.views[4].display_order).toBe(3)
            expect(nextOrderedSettings.views[5].display_order).toBe(4)
            expect(nextOrderedSettings.view_sections[2].display_order).toBe(5)
            expect(nextOrderedSettings.views[6].display_order).toBe(6)
            expect(nextOrderedSettings.views[2].display_order).toBe(7)
        })

        it('should move a section above a root view', () => {
            const nextOrderedSettings = getNextSettings(
                { id: 1, type: TicketNavbarElementType.Section },
                {
                    viewId: 2,
                    direction: TicketNavbarDropDirection.Up,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections,
            )

            expect(nextOrderedSettings.views[1].display_order).toBe(0)
            expect(nextOrderedSettings.view_sections[1].display_order).toBe(1)
            expect(nextOrderedSettings.views[3].display_order).toBe(2)
            expect(nextOrderedSettings.views[4].display_order).toBe(3)
            expect(nextOrderedSettings.views[5].display_order).toBe(4)
            expect(nextOrderedSettings.views[2].display_order).toBe(5)
            expect(nextOrderedSettings.view_sections[2].display_order).toBe(6)
            expect(nextOrderedSettings.views[6].display_order).toBe(7)
        })

        it('should move a section above another section', () => {
            const nextOrderedSettings = getNextSettings(
                { id: 2, type: TicketNavbarElementType.Section },
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Up,
                    sectionId: 1,
                },
                orderedElements,
                views,
                sections,
            )

            expect(nextOrderedSettings.views[1].display_order).toBe(0)
            expect(nextOrderedSettings.views[2].display_order).toBe(1)
            expect(nextOrderedSettings.view_sections[2].display_order).toBe(2)
            expect(nextOrderedSettings.views[6].display_order).toBe(3)
            expect(nextOrderedSettings.view_sections[1].display_order).toBe(4)
            expect(nextOrderedSettings.views[3].display_order).toBe(5)
            expect(nextOrderedSettings.views[4].display_order).toBe(6)
            expect(nextOrderedSettings.views[5].display_order).toBe(7)
        })

        it('should move a section to top content boundary', () => {
            const nextOrderedSettings = getNextSettings(
                { id: 1, type: TicketNavbarElementType.Section },
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Up,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections,
            )

            expect(nextOrderedSettings.view_sections[1].display_order).toBe(0)
            expect(nextOrderedSettings.views[3].display_order).toBe(1)
            expect(nextOrderedSettings.views[4].display_order).toBe(2)
            expect(nextOrderedSettings.views[5].display_order).toBe(3)
            expect(nextOrderedSettings.views[1].display_order).toBe(4)
            expect(nextOrderedSettings.views[2].display_order).toBe(5)
            expect(nextOrderedSettings.view_sections[2].display_order).toBe(6)
            expect(nextOrderedSettings.views[6].display_order).toBe(7)
        })

        it('should move a section to bottom content boundary', () => {
            const nextOrderedSettings = getNextSettings(
                { id: 1, type: TicketNavbarElementType.Section },
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections,
            )

            expect(nextOrderedSettings.views[1].display_order).toBe(0)
            expect(nextOrderedSettings.views[2].display_order).toBe(1)
            expect(nextOrderedSettings.view_sections[2].display_order).toBe(2)
            expect(nextOrderedSettings.views[6].display_order).toBe(3)
            expect(nextOrderedSettings.view_sections[1].display_order).toBe(4)
            expect(nextOrderedSettings.views[3].display_order).toBe(5)
            expect(nextOrderedSettings.views[4].display_order).toBe(6)
            expect(nextOrderedSettings.views[5].display_order).toBe(7)
        })

        it('should move a view onto a section header with down direction (becomes first child)', () => {
            const nextOrderedSettings = getNextSettings(
                { id: 1, type: TicketNavbarElementType.View },
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: 1,
                },
                orderedElements,
                views,
                sections,
            )

            expect(nextOrderedSettings.views[2].display_order).toBe(0)
            expect(nextOrderedSettings.view_sections[1].display_order).toBe(1)
            expect(nextOrderedSettings.views[1].display_order).toBe(2)
            expect(nextOrderedSettings.views[3].display_order).toBe(3)
            expect(nextOrderedSettings.views[4].display_order).toBe(4)
            expect(nextOrderedSettings.views[5].display_order).toBe(5)
            expect(nextOrderedSettings.view_sections[2].display_order).toBe(6)
            expect(nextOrderedSettings.views[6].display_order).toBe(7)
        })
    })
})
