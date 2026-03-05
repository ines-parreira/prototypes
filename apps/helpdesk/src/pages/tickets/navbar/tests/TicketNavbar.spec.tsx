import type { ComponentProps, ReactNode } from 'react'

import { fireEvent } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { createBrowserHistory } from 'history'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'

import { UserRole } from 'config/types/user'
import { section } from 'fixtures/section'
import { user } from 'fixtures/users'
import { view } from 'fixtures/views'
import client from 'models/api/resources'
import type { View } from 'models/view/types'
import { ViewType, ViewVisibility } from 'models/view/types'
import { useSplitTicketViewSwitcher } from 'split-ticket-view-toggle'
import { NotificationStatus } from 'state/notifications/types'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'
import { mockStore, renderWithRouter } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

import type DeleteSectionModal from '../DeleteSectionModal'
import type SectionFormModal from '../SectionFormModal'
import { TicketNavbarContainer } from '../TicketNavbar'
import type { TicketNavbarBlock } from '../TicketNavbarBlock'
import type TicketNavbarContent from '../TicketNavbarContent'

jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useSidebar: jest.fn(() => ({
        isCollapsed: false,
        toggleCollapse: jest.fn(),
    })),
}))
const mockUseSidebar = jest.requireMock('@repo/navigation')
    .useSidebar as jest.Mock

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn(() => false),
}))
const mockUseHelpdeskV2WayfindingMS1Flag = jest.requireMock(
    '@repo/feature-flags',
).useHelpdeskV2WayfindingMS1Flag as jest.Mock

jest.mock('common/navigation', () => ({
    ActiveContent: { Tickets: 'tickets' },
    Navbar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

jest.mock('../RecentChats', () => ({
    RecentChats: () => <div>RecentChats</div>,
}))
jest.mock('../TicketNavbarBlock', () => ({
    TicketNavbarBlock: ({
        actions,
        children,
    }: ComponentProps<typeof TicketNavbarBlock>) => (
        <div data-testid="NavbarBlock">
            NavbarBlock:{' '}
            {actions?.map((value) => (
                <span
                    data-testid={`NavbarBlock-${value.label}`}
                    key={value.label}
                    onClick={value.onClick}
                >
                    {value.label}
                </span>
            ))}
            {children}
        </div>
    ),
}))

jest.mock('split-ticket-view-toggle')
const useSplitTicketViewSwitcherMock = useSplitTicketViewSwitcher as jest.Mock

jest.mock('../TicketNavbarViewLink', () => ({
    TicketNavbarViewLink: ({ view }: { view: View }) => (
        <span>{view.name}</span>
    ),
}))
jest.mock(
    '../SectionFormModal',
    () =>
        ({
            isNewSection,
            isOpen,
            isSubmitting,
            onChange,
            onClose,
            onSubmit,
            sectionForm,
        }: ComponentProps<typeof SectionFormModal>) => (
            <div data-testid="SectionFormModal">
                <input
                    type="text"
                    data-testid="SectionModal-change"
                    onChange={(e) => {
                        onChange(e.target.name as any, e.target.value as any)
                    }}
                />
                <div data-testid="SectionModal-close" onClick={onClose} />
                <div data-testid="SectionModal-submit" onClick={onSubmit} />
                <div>isNewSection: {isNewSection.toString()}</div>
                <div>isOpen: {isOpen.toString()}</div>
                <div>isSubmitting: {isSubmitting.toString()}</div>
                <div>sectionForm: {JSON.stringify(sectionForm)}</div>
            </div>
        ),
)
jest.mock(
    '../DeleteSectionModal',
    () =>
        ({
            isOpen,
            isSubmitting,
            onClose,
            onSubmit,
            section,
        }: ComponentProps<typeof DeleteSectionModal>) => (
            <div data-testid="DeleteSectionModal">
                <div data-testid="DeleteModal-close" onClick={onClose} />
                <div data-testid="DeleteModal-submit" onClick={onSubmit} />
                <div>isOpen: {isOpen.toString()}</div>
                <div>isSubmitting: {isSubmitting.toString()}</div>
                <div>section: {JSON.stringify(section)}</div>
            </div>
        ),
)
jest.mock(
    '../TicketNavbarContent',
    () =>
        ({
            elements,
            onSectionDeleteClick,
            onSectionRenameClick,
        }: ComponentProps<typeof TicketNavbarContent>) => (
            <div data-testid="TicketNavbarContent">
                {elements.map((element) => (
                    <div key={element.data.id}>
                        element: {JSON.stringify(element)}
                    </div>
                ))}
                {onSectionDeleteClick && (
                    <div
                        data-testid="TicketNavbarContent-delete"
                        onClick={() => onSectionDeleteClick(1)}
                    />
                )}
                {onSectionRenameClick && (
                    <div
                        data-testid="TicketNavbarContent-rename"
                        onClick={() => onSectionRenameClick(1)}
                    />
                )}
            </div>
        ),
)
const mockedServer = new MockAdapter(client)

describe('<TicketNavbar/>', () => {
    const minProps = {
        activeViewId: 4,
        activeViewIdSet: jest.fn(),
        currentUser: fromJS({
            ...user,
            role: {
                id: 1,
                name: UserRole.LiteAgent,
            },
        }),
        fetchViewsSuccess: jest.fn(),
        notify: jest.fn(),
        isLoading: false,
        sections: { [section.id]: section },
        sectionsFetched: jest.fn(),
        sectionCreated: jest.fn(),
        sectionDeleted: jest.fn(),
        sectionUpdated: jest.fn(),
        viewsFetched: jest.fn(),
        privateElements: [
            {
                data: {
                    id: 5,
                    section_id: null,
                    type: ViewType.TicketList,
                    visibility: ViewVisibility.Private,
                },
                type: TicketNavbarElementType.View,
            },
        ],
        sharedElements: [
            {
                data: {
                    id: 4,
                    section_id: null,
                    type: ViewType.TicketList,
                    visibility: ViewVisibility.Public,
                },
                type: TicketNavbarElementType.View,
            },
            {
                children: [
                    {
                        id: 1,
                        section_id: section.id,
                        type: ViewType.TicketList,
                        visibility: ViewVisibility.Public,
                    },
                ],
                data: section,
                type: TicketNavbarElementType.Section,
            },
        ],
    } as unknown as ComponentProps<typeof TicketNavbarContainer>

    const store = {
        entities: fromJS({}),
    }

    beforeEach(() => {
        jest.resetAllMocks()
        mockedServer.reset()
        mockedServer.onGet(/\/api\/views\/.*/).reply(200, {
            data: [view],
            meta: {},
        })
        mockedServer
            .onGet('/api/view-sections/')
            .reply(200, { data: [section] })
        mockedServer.onPost('/api/view-sections/').reply(200, section)
        mockedServer.onPut(/\/api\/view-sections\/\d+\//).reply(200, section)
        mockedServer.onDelete(/\/api\/view-sections\/\d+\//).reply(200)

        useSplitTicketViewSwitcherMock.mockImplementation(_noop)
        mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(false)
        mockUseSidebar.mockReturnValue({
            isCollapsed: false,
            toggleCollapse: jest.fn(),
        })
    })

    it('should fetch the views and dispatch the views actions (legacy views + views entity)', (done) => {
        renderWithRouter(
            <DndProvider backend={HTML5Backend}>
                <Provider store={mockStore(store as any)}>
                    <TicketNavbarContainer {...minProps} />
                </Provider>
            </DndProvider>,
            {
                path: '/foo/:viewId?',
                route: '/foo/1',
            },
        )

        setImmediate(() => {
            expect(minProps.fetchViewsSuccess).toHaveBeenNthCalledWith(
                1,
                { data: [view] },
                '1',
            )
            expect(minProps.viewsFetched).toHaveBeenNthCalledWith(1, [view])
            done()
        })
    })

    it('should fetch the sections and dispatch the result', (done) => {
        renderWithRouter(
            <DndProvider backend={HTML5Backend}>
                <Provider store={mockStore(store as any)}>
                    <TicketNavbarContainer {...minProps} />
                </Provider>
            </DndProvider>,
            {
                path: '/foo/:viewId?',
                route: '/foo/1',
            },
        )

        setImmediate(() => {
            expect(minProps.sectionsFetched).toHaveBeenNthCalledWith(1, [
                section,
            ])
            done()
        })
    })

    it('should fallback to location view id when view id is missing from the params', (done) => {
        const history = createBrowserHistory()
        history.push('/foo/1')

        history.push('/foo?viewId=2')
        renderWithRouter(
            <DndProvider backend={HTML5Backend}>
                <Provider store={mockStore(store as any)}>
                    <TicketNavbarContainer {...minProps} />
                </Provider>
            </DndProvider>,
            {
                history,
                path: '/foo/:viewId?',
            },
        )

        setImmediate(() => {
            expect(minProps.fetchViewsSuccess).toHaveBeenNthCalledWith(
                1,
                { data: [view] },
                '2',
            )
            done()
        })
    })

    it('should dispatch a notification when failing to fetch views', (done) => {
        mockedServer.onGet(/\/api\/views\/.*/).reply(503, { message: 'error' })
        renderWithRouter(
            <DndProvider backend={HTML5Backend}>
                <Provider store={mockStore(store as any)}>
                    <TicketNavbarContainer {...minProps} />
                </Provider>
            </DndProvider>,
            {
                path: '/foo/:viewId?',
                route: '/foo/1',
            },
        )

        setImmediate(() => {
            expect(minProps.notify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to fetch views',
                status: NotificationStatus.Error,
            })
            done()
        })
    })

    it('should create a new section', (done) => {
        const { getByTestId } = renderWithRouter(
            <DndProvider backend={HTML5Backend}>
                <Provider store={mockStore(store as any)}>
                    <TicketNavbarContainer {...minProps} />
                </Provider>
            </DndProvider>,
            {
                path: '/foo/:viewId?',
                route: '/foo/1',
            },
        )

        fireEvent.click(getByTestId('NavbarBlock-Create section'))
        fireEvent.click(getByTestId('SectionModal-submit'))

        setImmediate(() => {
            expect(minProps.sectionCreated).toHaveBeenNthCalledWith(1, section)
            done()
        })
    })

    it('should update a section', (done) => {
        const { getByTestId } = renderWithRouter(
            <DndProvider backend={HTML5Backend}>
                <Provider store={mockStore(store as any)}>
                    <TicketNavbarContainer {...minProps} />
                </Provider>
            </DndProvider>,
            {
                path: '/foo/:viewId?',
                route: '/foo/1',
            },
        )

        fireEvent.click(getByTestId('TicketNavbarContent-rename'))
        fireEvent.click(getByTestId('SectionModal-submit'))

        setImmediate(() => {
            expect(minProps.sectionUpdated).toHaveBeenNthCalledWith(1, section)
            done()
        })
    })

    it('should delete a section', (done) => {
        const { getByTestId } = renderWithRouter(
            <DndProvider backend={HTML5Backend}>
                <Provider store={mockStore(store as any)}>
                    <TicketNavbarContainer {...minProps} />
                </Provider>
            </DndProvider>,
            {
                path: '/foo/:viewId?',
                route: '/foo/1',
            },
        )

        fireEvent.click(getByTestId('TicketNavbarContent-delete'))
        fireEvent.click(getByTestId('DeleteModal-submit'))

        setImmediate(() => {
            expect(minProps.sectionDeleted).toHaveBeenNthCalledWith(1, 1)
            done()
        })
    })

    it('should not render system top elements container when empty', () => {
        const storeWithEmptySystemViews = {
            ...store,
            entities: fromJS({
                views: {
                    items: [],
                },
            }),
            views: fromJS({
                systemTopElements: [],
                viewsCount: {},
            }),
        }

        const { queryByTestId } = renderWithRouter(
            <DndProvider backend={HTML5Backend}>
                <Provider store={mockStore(storeWithEmptySystemViews as any)}>
                    <TicketNavbarContainer {...minProps} />
                </Provider>
            </DndProvider>,
            {
                path: '/foo/:viewId?',
                route: '/foo/1',
            },
        )

        // Check that the system views container is not rendered
        expect(queryByTestId('new-system-views')).not.toBeInTheDocument()
    })

    describe('sidebar collapsed state with wayfinding flag', () => {
        beforeEach(() => {
            mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(true)
        })

        it('should return null when sidebar is collapsed and wayfinding flag is enabled', () => {
            mockUseSidebar.mockReturnValue({
                isCollapsed: true,
                toggleCollapse: jest.fn(),
            })

            const { container } = renderWithRouter(
                <DndProvider backend={HTML5Backend}>
                    <Provider store={mockStore(store as any)}>
                        <TicketNavbarContainer {...minProps} />
                    </Provider>
                </DndProvider>,
                {
                    path: '/foo/:viewId?',
                    route: '/foo/1',
                },
            )

            expect(container.firstChild).toBeNull()
        })

        it('should render when sidebar is expanded and wayfinding flag is enabled', () => {
            mockUseSidebar.mockReturnValue({
                isCollapsed: false,
                toggleCollapse: jest.fn(),
            })

            const { queryAllByTestId } = renderWithRouter(
                <DndProvider backend={HTML5Backend}>
                    <Provider store={mockStore(store as any)}>
                        <TicketNavbarContainer {...minProps} />
                    </Provider>
                </DndProvider>,
                {
                    path: '/foo/:viewId?',
                    route: '/foo/1',
                },
            )

            const navbarBlocks = queryAllByTestId('NavbarBlock')
            expect(navbarBlocks.length).toBeGreaterThan(0)
        })
    })

    describe('without wayfinding flag', () => {
        beforeEach(() => {
            mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(false)
        })

        it('should render regardless of sidebar collapsed state', () => {
            mockUseSidebar.mockReturnValue({
                isCollapsed: true,
                toggleCollapse: jest.fn(),
            })

            const { queryAllByTestId } = renderWithRouter(
                <DndProvider backend={HTML5Backend}>
                    <Provider store={mockStore(store as any)}>
                        <TicketNavbarContainer {...minProps} />
                    </Provider>
                </DndProvider>,
                {
                    path: '/foo/:viewId?',
                    route: '/foo/1',
                },
            )

            const navbarBlocks = queryAllByTestId('NavbarBlock')
            expect(navbarBlocks.length).toBeGreaterThan(0)
        })
    })
})
