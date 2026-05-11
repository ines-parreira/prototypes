import type { ComponentProps, ReactNode } from 'react'

import client from '@repo/api-resources'
import { render } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'
import { fromJS } from 'immutable'
import _noop from 'lodash/noop'

import { UserRole } from 'config/types/user'
import { section } from 'fixtures/section'
import { user } from 'fixtures/users'
import { view } from 'fixtures/views'
import type { View } from 'models/view/types'
import { ViewType, ViewVisibility } from 'models/view/types'
import { useSplitTicketViewSwitcher } from 'split-ticket-view-toggle'
import { submitSettingSuccess } from 'state/currentUser/actions'
import {
    optimisticAccountSettingsReset,
    optimisticUserSettingsReset,
} from 'state/ui/ticketNavbar/actions'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'

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
    Navbar: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}))

jest.mock('../RecentChats', () => ({
    RecentChats: () => <div>RecentChats</div>,
}))
jest.mock('../TicketNavbarCreateMenu', () => ({
    TicketNavbarCreateMenu: () => <div>TicketNavbarCreateMenu</div>,
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
jest.mock('@repo/tickets', () => ({
    ...jest.requireActual('@repo/tickets'),
    CollapsedDefaultViews: () => <div>CollapsedDefaultViews</div>,
}))
jest.mock('../DefaultViews', () => ({
    DefaultViews: () => <div>DefaultViews</div>,
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
            isPrivate,
            onSubmitMoveItem,
            onSectionDeleteClick,
            onSectionRenameClick,
        }: ComponentProps<typeof TicketNavbarContent>) => {
            if (isPrivate) {
                privateOnSubmitMoveItem = onSubmitMoveItem
            } else {
                publicOnSubmitMoveItem = onSubmitMoveItem
            }

            return (
                <div
                    data-testid="TicketNavbarContent"
                    data-scope={isPrivate ? 'private' : 'public'}
                >
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
            )
        },
)
const mockedServer = new MockAdapter(client)
let publicOnSubmitMoveItem:
    | ComponentProps<typeof TicketNavbarContent>['onSubmitMoveItem']
    | undefined
let privateOnSubmitMoveItem:
    | ComponentProps<typeof TicketNavbarContent>['onSubmitMoveItem']
    | undefined

type RenderNavbarParams = {
    path?: string
    route?: string
    state?: object
}

function makeTestView(overrides: Partial<View>): View {
    return {
        ...view,
        ...overrides,
    }
}

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
        isLoading: false,
        sections: { [section.id]: section },
        sectionsFetched: jest.fn(),
        sectionCreated: jest.fn(),
        sectionDeleted: jest.fn(),
        sectionUpdated: jest.fn(),
        viewUpdated: jest.fn(),
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

    function renderNavbar(
        props: ComponentProps<typeof TicketNavbarContainer> = minProps,
        {
            state = store,
            path = '/foo/:viewId?',
            route = '/foo/1',
        }: RenderNavbarParams = {},
    ) {
        return render(<TicketNavbarContainer {...props} />, {
            initialEntries: [route],
            path,
            storeState: state as any,
        })
    }

    beforeEach(() => {
        jest.resetAllMocks()
        mockedServer.reset()
        publicOnSubmitMoveItem = undefined
        privateOnSubmitMoveItem = undefined
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
        renderNavbar()

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
        renderNavbar()

        setImmediate(() => {
            expect(minProps.sectionsFetched).toHaveBeenNthCalledWith(1, [
                section,
            ])
            done()
        })
    })

    it('should fallback to location view id when view id is missing from the params', (done) => {
        renderNavbar(minProps, { route: '/foo?viewId=2' })

        setImmediate(() => {
            expect(minProps.fetchViewsSuccess).toHaveBeenNthCalledWith(
                1,
                { data: [view] },
                '2',
            )
            done()
        })
    })

    it('should dispatch a notification when failing to fetch views', async () => {
        mockedServer.onGet(/\/api\/views\/.*/).reply(503, { message: 'error' })
        renderNavbar()

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'Failed to fetch views',
            })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should save public ordering after moving a shared view', async () => {
        const currentPublicView = makeTestView({
            id: 4,
            section_id: null,
            visibility: ViewVisibility.Public,
        })
        const nextPublicView = makeTestView({
            id: 4,
            section_id: 1,
            visibility: ViewVisibility.Public,
        })

        mockedServer.onPut('/api/views/4/').reply(200, {
            ...nextPublicView,
        })
        mockedServer.onPost('/api/account/settings/').reply(200, {
            id: 42,
            type: 'views-ordering',
            data: {
                views: { 4: { display_order: 1 } },
                view_sections: { 1: { display_order: 0 } },
            },
        })

        renderNavbar({
            ...minProps,
            accountSetting: {} as any,
            optimisticAccountSettingsReset,
        })

        expect(publicOnSubmitMoveItem).toBeDefined()

        await act(async () => {
            await publicOnSubmitMoveItem!(
                {
                    data: nextPublicView,
                    type: TicketNavbarElementType.View,
                },
                {
                    data: currentPublicView,
                    type: TicketNavbarElementType.View,
                },
                {
                    views: { 4: { display_order: 1 } },
                    view_sections: { 1: { display_order: 0 } },
                },
                false,
            )
        })

        expect(mockedServer.history.put).toHaveLength(1)
        expect(mockedServer.history.put[0].url).toBe('/api/views/4/')
        expect(mockedServer.history.post).toHaveLength(1)
        expect(mockedServer.history.post[0].url).toBe('/api/account/settings/')
        expect(JSON.parse(mockedServer.history.post[0].data)).toEqual({
            type: 'views-ordering',
            data: {
                views: { 4: { display_order: 1 } },
                view_sections: { 1: { display_order: 0 } },
            },
        })
    })

    it('should save private ordering after reordering a private view', async () => {
        const privateView = makeTestView({
            id: 5,
            section_id: null,
            visibility: ViewVisibility.Private,
        })

        mockedServer.onPost('/api/users/0/settings/').reply(200, {
            id: 77,
            type: 'views-ordering',
            data: {
                views: { 5: { display_order: 1 } },
                view_sections: { 2: { display_order: 0 } },
            },
        })

        renderNavbar({
            ...minProps,
            accountSetting: {} as any,
            optimisticUserSettingsReset,
            submitSettingSuccess,
        })

        const nextPrivateOrdering = {
            views: { 5: { display_order: 1 } },
            view_sections: { 2: { display_order: 0 } },
        }

        expect(privateOnSubmitMoveItem).toBeDefined()

        await act(async () => {
            await privateOnSubmitMoveItem!(
                {
                    data: privateView,
                    type: TicketNavbarElementType.View,
                },
                {
                    data: privateView,
                    type: TicketNavbarElementType.View,
                },
                nextPrivateOrdering,
                true,
            )
        })

        expect(mockedServer.history.post).toHaveLength(1)
        expect(mockedServer.history.post[0].url).toBe('/api/users/0/settings/')
        expect(JSON.parse(mockedServer.history.post[0].data)).toEqual({
            type: 'views-ordering',
            data: nextPrivateOrdering,
        })
    })

    it('should create a new section', (done) => {
        const { getByTestId } = renderNavbar()

        fireEvent.click(getByTestId('NavbarBlock-Create section'))
        fireEvent.click(getByTestId('SectionModal-submit'))

        setImmediate(() => {
            expect(minProps.sectionCreated).toHaveBeenNthCalledWith(1, section)
            done()
        })
    })

    it('should update a section', (done) => {
        const { getByTestId } = renderNavbar()

        fireEvent.click(getByTestId('TicketNavbarContent-rename'))
        fireEvent.click(getByTestId('SectionModal-submit'))

        setImmediate(() => {
            expect(minProps.sectionUpdated).toHaveBeenNthCalledWith(1, section)
            done()
        })
    })

    it('should delete a section', (done) => {
        const { getByTestId } = renderNavbar()

        fireEvent.click(getByTestId('TicketNavbarContent-delete'))
        fireEvent.click(getByTestId('DeleteModal-submit'))

        setImmediate(() => {
            expect(minProps.sectionDeleted).toHaveBeenNthCalledWith(1, 1)
            done()
        })
    })

    it('shows an error toast when fetching sections fails', async () => {
        mockedServer.onGet('/api/view-sections/').reply(503, {
            message: 'error',
        })

        renderNavbar()

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'Failed to fetch sections',
            })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows an error toast when creating a section fails', async () => {
        mockedServer.onPost('/api/view-sections/').reply(500)

        const { getByTestId } = renderNavbar()

        fireEvent.click(getByTestId('NavbarBlock-Create section'))
        fireEvent.click(getByTestId('SectionModal-submit'))

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'Failed to create section',
            })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows an error toast when updating a section fails', async () => {
        mockedServer.onPut(/\/api\/view-sections\/\d+\//).reply(500)

        const { getByTestId } = renderNavbar()

        fireEvent.click(getByTestId('TicketNavbarContent-rename'))
        fireEvent.click(getByTestId('SectionModal-submit'))

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'Failed to update section',
            })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows an error toast when deleting a section fails', async () => {
        mockedServer.onDelete(/\/api\/view-sections\/\d+\//).reply(500)

        const { getByTestId } = renderNavbar()

        fireEvent.click(getByTestId('TicketNavbarContent-delete'))
        fireEvent.click(getByTestId('DeleteModal-submit'))

        await waitFor(() => {
            const toast = screen.getByRole('status', {
                name: 'Failed to delete the section',
            })
            expect(toast).toHaveAttribute('data-intent', 'destructive')
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
            }),
        }

        const { queryByTestId } = renderNavbar(minProps, {
            state: storeWithEmptySystemViews,
        })

        // Check that the system views container is not rendered
        expect(queryByTestId('new-system-views')).not.toBeInTheDocument()
    })

    describe('with wayfinding flag enabled', () => {
        beforeEach(() => {
            mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(true)
        })

        it('should create a new section', async () => {
            const user = userEvent.setup()
            const { getByRole, getByTestId, getByText } = renderNavbar()

            await user.click(getByRole('button', { name: 'add-plus-circle' }))

            await waitFor(() => {
                expect(getByText('Create section')).toBeInTheDocument()
            })
            await user.click(getByText('Create section'))
            await user.click(getByTestId('SectionModal-submit'))

            await waitFor(() => {
                expect(minProps.sectionCreated).toHaveBeenNthCalledWith(
                    1,
                    section,
                )
            })
        })

        it('should update a section', async () => {
            const user = userEvent.setup()
            const { getByTestId } = renderNavbar()

            await user.click(getByTestId('TicketNavbarContent-rename'))
            await user.click(getByTestId('SectionModal-submit'))

            await waitFor(() => {
                expect(minProps.sectionUpdated).toHaveBeenNthCalledWith(
                    1,
                    section,
                )
            })
        })

        it('should delete a section', async () => {
            const user = userEvent.setup()
            const { getByTestId } = renderNavbar()

            await user.click(getByTestId('TicketNavbarContent-delete'))
            await user.click(getByTestId('DeleteModal-submit'))

            await waitFor(() => {
                expect(minProps.sectionDeleted).toHaveBeenNthCalledWith(1, 1)
            })
        })
    })

    describe('sidebar collapsed state with wayfinding flag', () => {
        beforeEach(() => {
            mockUseHelpdeskV2WayfindingMS1Flag.mockReturnValue(true)
        })

        it('should render CollapsedDefaultViews and RecentChats when sidebar is collapsed and wayfinding flag is enabled', () => {
            mockUseSidebar.mockReturnValue({
                isCollapsed: true,
                toggleCollapse: jest.fn(),
            })

            const { getByText } = renderNavbar()

            expect(getByText('CollapsedDefaultViews')).toBeInTheDocument()
            expect(getByText('RecentChats')).toBeInTheDocument()
        })

        it('should render RecentChats and TicketNavbarContent when sidebar is expanded and wayfinding flag is enabled', () => {
            mockUseSidebar.mockReturnValue({
                isCollapsed: false,
                toggleCollapse: jest.fn(),
            })

            const { queryAllByTestId, getByText } = renderNavbar()

            const navbarContents = queryAllByTestId('TicketNavbarContent')
            expect(navbarContents.length).toBeGreaterThan(0)
            expect(getByText('RecentChats')).toBeInTheDocument()
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

            const { queryAllByTestId } = renderNavbar()

            const navbarBlocks = queryAllByTestId('NavbarBlock')
            expect(navbarBlocks.length).toBeGreaterThan(0)
        })
    })
})
