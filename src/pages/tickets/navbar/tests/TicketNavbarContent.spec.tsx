import {render, fireEvent} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {fromJS} from 'immutable'

import {section} from '../../../../fixtures/section'
import {user} from '../../../../fixtures/users'
import {view} from '../../../../fixtures/views'
import {TicketNavbarElementType} from '../TicketNavbar'
import {
    TicketNavbarContentContainer,
    TicketNavbarElement,
    getNextSettings,
} from '../TicketNavbarContent'
import TicketNavbarView from '../TicketNavbarView'
import {TicketNavbarDropDirection} from '../TicketNavbarDropTarget'
import TicketNavbarSection from '../TicketNavbarSection'

jest.mock(
    '../TicketNavbarView',
    () =>
        ({view}: ComponentProps<typeof TicketNavbarView>) => {
            return <div data-testid="TicketNavbarView">{view.name}</div>
        }
)

jest.mock(
    '../TicketNavbarSection',
    () => (props: ComponentProps<typeof TicketNavbarSection>) => {
        return (
            <div
                data-testid="TicketNavbarSection"
                onClick={() =>
                    props.onSectionClick(props.sectionElement.data.id)
                }
            >
                {JSON.stringify(props)}
            </div>
        )
    }
)

describe('<TicketNavbarContent/>', () => {
    const minProps = {
        elements: [
            {
                data: section,
                type: TicketNavbarElementType.Section,
                children: [],
            },
            {
                data: view,
                type: TicketNavbarElementType.View,
            },
        ] as TicketNavbarElement[],
        onClickDeleteSection: null,
        onClickRenameSection: null,
        currentUser: fromJS(user),
        views: {
            [view.id]: {...view, section_id: 4},
        },
        notify: jest.fn(),
        viewUpdated: jest.fn(),
        isPrivate: true,
    } as unknown as ComponentProps<typeof TicketNavbarContentContainer>

    beforeEach(() => {
        global.localStorage.setItem(
            'collapsed-view-sections',
            JSON.stringify([2])
        )
    })

    afterAll(() => {
        global.localStorage.removeItem('collapsed-view-sections')
    })

    describe('rendering', () => {
        it('should render', () => {
            const {container} = render(
                <DndProvider backend={HTML5Backend}>
                    <TicketNavbarContentContainer {...minProps} />
                </DndProvider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should expand/collapse a section', () => {
            const {container, getByTestId} = render(
                <DndProvider backend={HTML5Backend}>
                    <TicketNavbarContentContainer {...minProps} />
                </DndProvider>
            )

            expect(container.firstChild).toMatchSnapshot()
            fireEvent.click(getByTestId('TicketNavbarSection'))
            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('getNextSettings', () => {
        const views = {
            1: {...view, id: 1},
            2: {...view, id: 2},
            3: {...view, id: 3, section_id: 1},
            4: {...view, id: 4, section_id: 1},
            5: {...view, id: 5, section_id: 1},
            6: {...view, id: 6, section_id: 2},
        }
        const sections = {
            1: {...section, id: 1},
            2: {...section, id: 2},
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
                {id: 1, type: TicketNavbarElementType.View},
                {
                    viewId: 2,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections
            )
            expect(nextOrderedSettings).toMatchSnapshot()
        })

        it('should move a root view to a section view', () => {
            const nextOrderedSettings = getNextSettings(
                {id: 1, type: TicketNavbarElementType.View},
                {
                    viewId: 3,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: 1,
                },
                orderedElements,
                views,
                sections
            )

            expect(nextOrderedSettings).toMatchSnapshot()
        })

        it('should move a section view to a root view', () => {
            const nextOrderedSettings = getNextSettings(
                {id: 4, type: TicketNavbarElementType.View},
                {
                    viewId: 2,
                    direction: TicketNavbarDropDirection.Up,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections
            )

            expect(nextOrderedSettings).toMatchSnapshot()
        })

        it('should move a section view to a section view', () => {
            const nextOrderedSettings = getNextSettings(
                {id: 3, type: TicketNavbarElementType.View},
                {
                    viewId: 4,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: 1,
                },
                orderedElements,
                views,
                sections
            )

            expect(nextOrderedSettings).toMatchSnapshot()
        })

        it('should move a view to content boundary', () => {
            let nextOrderedSettings = getNextSettings(
                {id: 2, type: TicketNavbarElementType.View},
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Up,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections
            )

            expect(nextOrderedSettings).toMatchSnapshot()
            nextOrderedSettings = getNextSettings(
                {id: 2, type: TicketNavbarElementType.View},
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections
            )

            expect(nextOrderedSettings).toMatchSnapshot()
        })

        it('should move a section to a root view', () => {
            const nextOrderedSettings = getNextSettings(
                {id: 1, type: TicketNavbarElementType.Section},
                {
                    viewId: 2,
                    direction: TicketNavbarDropDirection.Up,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections
            )

            expect(nextOrderedSettings).toMatchSnapshot()
        })

        it('should move a section to a section', () => {
            const nextOrderedSettings = getNextSettings(
                {id: 2, type: TicketNavbarElementType.Section},
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Up,
                    sectionId: 1,
                },
                orderedElements,
                views,
                sections
            )

            expect(nextOrderedSettings).toMatchSnapshot()
        })

        it('should move a section to content boundary', () => {
            let nextOrderedSettings = getNextSettings(
                {id: 1, type: TicketNavbarElementType.Section},
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Up,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections
            )

            expect(nextOrderedSettings).toMatchSnapshot()
            nextOrderedSettings = getNextSettings(
                {id: 1, type: TicketNavbarElementType.Section},
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: null,
                },
                orderedElements,
                views,
                sections
            )

            expect(nextOrderedSettings).toMatchSnapshot()
        })

        it('should move a view ontop of a section', () => {
            const nextOrderedSettings = getNextSettings(
                {id: 1, type: TicketNavbarElementType.View},
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Up,
                    sectionId: 1,
                },
                orderedElements,
                views,
                sections
            )

            expect(nextOrderedSettings).toMatchSnapshot()
        })

        it('should move a view down a section', () => {
            const nextOrderedSettings = getNextSettings(
                {id: 1, type: TicketNavbarElementType.View},
                {
                    viewId: null,
                    direction: TicketNavbarDropDirection.Down,
                    sectionId: 1,
                },
                orderedElements,
                views,
                sections
            )

            expect(nextOrderedSettings).toMatchSnapshot()
        })
    })
})
