import { ComponentProps } from 'react'

import { render, RenderOptions } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useDrag } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'

import { MAX_TICKET_COUNT_PER_VIEW } from 'config/views'
import { user as agentUserFixture } from 'fixtures/users'
import { view as viewFixture } from 'fixtures/views'
import useAppSelector from 'hooks/useAppSelector'
import { View, ViewVisibility } from 'models/view/types'
import TicketNavbarDropTarget from 'pages/tickets/navbar/TicketNavbarDropTarget'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'
import { mockStore } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

import { TicketNavbarViewV2 } from '../v2/TicketNavbarViewV2'

import css from '../v2/TicketNavbarViewV2.less'

// --- Mocks ---
jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('react-dnd', () => ({
    ...jest.requireActual('react-dnd'), // Keep original exports
    useDrag: jest.fn(),
}))
const useDragMock = useDrag as jest.Mock

// Mock nested components
jest.mock('../TicketNavbarDropTarget', () =>
    jest.fn(({ children }) => children),
)
const TicketNavbarDropTargetMock =
    TicketNavbarDropTarget as jest.Mock<JSX.Element>

jest.mock('../v2/TicketNavbarViewLinkV2', () =>
    jest.fn(({ view, viewCount, className }) => (
        <div data-testid="TicketNavbarViewLinkV2" className={className}>
            {view.name} - {viewCount}
        </div>
    )),
)
// --- Test Setup ---

const defaultView: View = {
    ...viewFixture,
    id: 1,
    name: 'Test View 1',
    visibility: ViewVisibility.Public,
    section_id: null,
}

const privateView: View = {
    ...defaultView,
    id: 2,
    name: 'Private View',
    visibility: ViewVisibility.Private,
}

const nestedView: View = {
    ...defaultView,
    id: 3,
    name: 'Nested View',
    section_id: 10,
}

const defaultState = {
    entities: {
        views: {
            [defaultView.id]: defaultView,
            [privateView.id]: privateView,
            [nestedView.id]: nestedView,
            4: { ...defaultView, id: 4, name: 'Other Public' },
            5: { ...privateView, id: 5, name: 'Other Private' },
        },
        sections: {
            10: {
                id: 10,
                name: 'Public Section',
                private: false,
                view_ids: [nestedView.id],
                account_id: 1,
            },
            11: {
                id: 11,
                name: 'Private Section',
                private: true,
                view_ids: [],
                account_id: 1,
            },
        },
    },
    currentUser: fromJS(agentUserFixture),
}

const nonAgentUser = fromJS({ ...agentUserFixture, role: 'viewer' })

type TestProps = Partial<ComponentProps<typeof TicketNavbarViewV2>>
type TestState = Partial<typeof defaultState>

const renderComponent = (
    props: TestProps = {},
    initialState: TestState = {},
    renderOptions?: RenderOptions,
) => {
    const mergedProps = {
        view: defaultView,
        viewCount: MAX_TICKET_COUNT_PER_VIEW,
        ...props,
    }
    const store = mockStore({ ...defaultState, ...initialState })
    useAppSelectorMock.mockImplementation((selector) =>
        selector(store.getState()),
    )

    const dragRef = jest.fn()
    useDragMock.mockReturnValue([{ isDragging: false }, dragRef])

    return render(
        <DndProvider backend={HTML5Backend}>
            <Provider store={store}>
                <TicketNavbarViewV2 {...mergedProps} />
            </Provider>
        </DndProvider>,
        renderOptions,
    )
}

describe('<TicketNavbarViewV2/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Reset to default agent user state before each test
        useAppSelectorMock.mockImplementation((selector) =>
            selector(mockStore(defaultState).getState()),
        )
    })

    // --- Dragging Logic ---
    describe('Dragging behavior', () => {
        it('should allow dragging for private views regardless of user role', () => {
            renderComponent(
                { view: privateView },
                { currentUser: nonAgentUser },
            )
            expect(useDragMock).toHaveBeenCalledWith(
                expect.objectContaining({ canDrag: true }),
            )
        })

        it('should allow dragging for public views if user is Agent', () => {
            renderComponent(
                { view: defaultView },
                { currentUser: fromJS(agentUserFixture) },
            )
            expect(useDragMock).toHaveBeenCalledWith(
                expect.objectContaining({ canDrag: true }),
            )
        })

        it('should NOT allow dragging for public views if user is not Agent', () => {
            renderComponent(
                { view: defaultView },
                { currentUser: nonAgentUser },
            )
            expect(useDragMock).toHaveBeenCalledWith(
                expect.objectContaining({ canDrag: false }),
            )
        })
    })

    // --- Drop Target Logic ---
    describe('TicketNavbarDropTarget', () => {
        it('should accept View and Section types', () => {
            renderComponent()
            expect(TicketNavbarDropTargetMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    accept: [
                        TicketNavbarElementType.View,
                        TicketNavbarElementType.Section,
                    ],
                }),
                {},
            )
        })

        it('should pass correct indicator class names for nested views', () => {
            renderComponent({ view: nestedView })
            expect(TicketNavbarDropTargetMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    topIndicatorClassName: css.nestedViewIndicator,
                    bottomIndicatorClassName: css.nestedViewIndicator,
                }),
                {},
            )
        })

        it('should not pass indicator class names for non-nested views', () => {
            renderComponent({ view: defaultView })
            expect(TicketNavbarDropTargetMock).not.toHaveBeenCalledWith(
                expect.objectContaining({
                    topIndicatorClassName: expect.any(String),
                    bottomIndicatorClassName: expect.any(String),
                }),
                {},
            )
        })

        describe('Drop behavior', () => {
            const getCanDrop = () => {
                renderComponent({ view: defaultView }) // Target is default public view
                return TicketNavbarDropTargetMock.mock.calls[0][0].canDrop
            }
            const getCanDropPrivateTarget = () => {
                renderComponent({ view: privateView }) // Target is private view
                return TicketNavbarDropTargetMock.mock.calls[0][0].canDrop
            }
            const getCanDropNestedTarget = () => {
                renderComponent({ view: nestedView }) // Target is nested view
                return TicketNavbarDropTargetMock.mock.calls[0][0].canDrop
            }

            // Item Types
            const publicViewItem = { type: TicketNavbarElementType.View, id: 4 } // Other Public View
            const privateViewItem = {
                type: TicketNavbarElementType.View,
                id: 5,
            } // Other Private View
            const publicSectionItem = {
                type: TicketNavbarElementType.Section,
                id: 10,
            }
            const privateSectionItem = {
                type: TicketNavbarElementType.Section,
                id: 11,
            }

            test('should NOT allow dropping Section onto a nested view', () => {
                const canDrop = getCanDropNestedTarget()
                expect(canDrop(publicSectionItem)).toBe(false)
                expect(canDrop(privateSectionItem)).toBe(false)
            })

            test('Public Target: should allow dropping public view/section', () => {
                const canDrop = getCanDrop()
                expect(canDrop(publicViewItem)).toBe(true)
                expect(canDrop(publicSectionItem)).toBe(true)
            })

            test('Public Target: should NOT allow dropping private view/section', () => {
                const canDrop = getCanDrop()
                expect(canDrop(privateViewItem)).toBe(false)
                expect(canDrop(privateSectionItem)).toBe(false)
            })

            test('Private Target: should allow dropping private view/section', () => {
                const canDrop = getCanDropPrivateTarget()
                expect(canDrop(privateViewItem)).toBe(true)
                expect(canDrop(privateSectionItem)).toBe(true)
            })

            test('Private Target: should NOT allow dropping public view/section', () => {
                const canDrop = getCanDropPrivateTarget()
                expect(canDrop(publicViewItem)).toBe(false)
                expect(canDrop(publicSectionItem)).toBe(false)
            })

            it('should return correct data on drop', () => {
                renderComponent({ view: nestedView }) // Use nested view to get section_id
                const onDrop =
                    TicketNavbarDropTargetMock.mock.calls[0][0].onDrop
                const dropResult = onDrop(
                    { type: TicketNavbarElementType.View, id: 1 },
                    {},
                    'above',
                ) // Dummy item, monitor, direction

                expect(dropResult).toEqual({
                    sectionId: nestedView.section_id,
                    viewId: nestedView.id,
                    direction: 'above',
                })
            })
        })
    })
})
