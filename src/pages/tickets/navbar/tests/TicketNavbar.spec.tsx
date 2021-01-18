import {render, fireEvent} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'
import React, {ComponentProps, ReactNode} from 'react'
import {Location} from 'history'

import {UserRole} from '../../../../config/types/user'
import {section} from '../../../../fixtures/section'
import {user} from '../../../../fixtures/users'
import {view} from '../../../../fixtures/views'
import client from '../../../../models/api/resources'
import {ViewType, ViewVisibility} from '../../../../models/view/types'
import {NotificationStatus} from '../../../../state/notifications/types'
import NavbarBlock from '../../../common/components/navbar/NavbarBlock'
import DeleteSectionModal from '../DeleteSectionModal'
import SectionFormModal from '../SectionFormModal'
import {TicketNavbarContainer, TicketNavbarElementType} from '../TicketNavbar'
import TicketNavbarContent from '../TicketNavbarContent'

jest.mock(
    '../../../common/components/Navbar.js',
    () => ({children}: {children: ReactNode}) => <div>{children}</div>
)
jest.mock('../../../common/components/RecentChats.js', () => () => (
    <div>RecentChats</div>
))
jest.mock(
    '../../../common/components/navbar/NavbarBlock',
    () => ({actions, children}: ComponentProps<typeof NavbarBlock>) => (
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
    )
)
jest.mock(
    '../SectionFormModal',
    () => ({
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
    )
)
jest.mock(
    '../DeleteSectionModal',
    () => ({
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
    )
)
jest.mock(
    '../TicketNavbarContent',
    () => ({
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
    )
)
const mockedServer = new MockAdapter(client)

describe('<TicketNavbar/>', () => {
    const minProps = ({
        activeViewId: 4,
        activeViewIdSet: jest.fn(),
        currentUser: fromJS({
            ...user,
            roles: [
                {
                    id: 1,
                    name: UserRole.LiteAgent,
                },
            ],
        }),
        fetchViewsSuccess: jest.fn(),
        match: {
            params: {
                viewId: '1',
            },
        },
        location: {
            query: {},
        },
        notify: jest.fn(),
        isLoading: false,
        sections: {[section.id]: section},
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
    } as unknown) as ComponentProps<typeof TicketNavbarContainer>

    beforeEach(() => {
        jest.resetAllMocks()
        mockedServer.reset()
        mockedServer.onGet('/api/views/').reply(200, {
            data: [view],
        })
        mockedServer.onGet('/api/view-sections/').reply(200, {data: [section]})
        mockedServer.onPost('/api/view-sections/').reply(200, section)
        mockedServer.onPut(/\/api\/view-sections\/\d+\//).reply(200, section)
        mockedServer.onDelete(/\/api\/view-sections\/\d+\//).reply(200)
    })

    it('should render', () => {
        const {container} = render(<TicketNavbarContainer {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch the views and dispatch the views actions (legacy views + views entity)', (done) => {
        render(<TicketNavbarContainer {...minProps} />)

        setImmediate(() => {
            expect(minProps.fetchViewsSuccess).toHaveBeenNthCalledWith(
                1,
                {data: [view]},
                '1'
            )
            expect(minProps.viewsFetched).toHaveBeenNthCalledWith(1, [view])
            done()
        })
    })

    it('should fetch the sections and dispatch the result', (done) => {
        render(<TicketNavbarContainer {...minProps} />)

        setImmediate(() => {
            expect(minProps.sectionsFetched).toHaveBeenNthCalledWith(1, [
                section,
            ])
            done()
        })
    })

    it('should fallback to location view id when view id is missing from the params', (done) => {
        render(
            <TicketNavbarContainer
                {...minProps}
                match={{params: {}} as any}
                location={{search: 'viewId=2'} as Location}
            />
        )

        setImmediate(() => {
            expect(minProps.fetchViewsSuccess).toHaveBeenNthCalledWith(
                1,
                {data: [view]},
                '2'
            )
            done()
        })
    })

    it('should dispatch a notification when failing to fetch views', (done) => {
        mockedServer.onGet('/api/views/').reply(503, {message: 'error'})
        render(<TicketNavbarContainer {...minProps} />)

        setImmediate(() => {
            expect(minProps.notify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to fetch views',
                status: NotificationStatus.Error,
            })
            done()
        })
    })

    it('should display shared actions for lead-agent/admin', () => {
        const {container} = render(
            <TicketNavbarContainer {...minProps} currentUser={fromJS(user)} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should open a new section modal when clicking create section', () => {
        const {container, getByTestId} = render(
            <TicketNavbarContainer {...minProps} />
        )

        fireEvent.click(getByTestId('NavbarBlock-Create section'))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should close a new section modal when clicking close section', () => {
        const {container, getByTestId} = render(
            <TicketNavbarContainer {...minProps} />
        )

        fireEvent.click(getByTestId('NavbarBlock-Create section'))
        fireEvent.click(getByTestId('SectionModal-close'))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should update the draft form on change', () => {
        const {container, getByTestId} = render(
            <TicketNavbarContainer {...minProps} />
        )

        fireEvent.click(getByTestId('NavbarBlock-Create section'))
        fireEvent.change(getByTestId('SectionModal-change'), {
            target: {
                name: 'name',
                value: 'foo',
            },
        })
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should create a new section', (done) => {
        const {getByTestId} = render(<TicketNavbarContainer {...minProps} />)

        fireEvent.click(getByTestId('NavbarBlock-Create section'))
        fireEvent.click(getByTestId('SectionModal-submit'))

        setImmediate(() => {
            expect(minProps.sectionCreated).toHaveBeenNthCalledWith(1, section)
            done()
        })
    })

    it('should update a section', (done) => {
        const {getByTestId} = render(<TicketNavbarContainer {...minProps} />)

        fireEvent.click(getByTestId('TicketNavbarContent-rename'))
        fireEvent.click(getByTestId('SectionModal-submit'))

        setImmediate(() => {
            expect(minProps.sectionUpdated).toHaveBeenNthCalledWith(1, section)
            done()
        })
    })

    it('should delete a section', (done) => {
        const {getByTestId} = render(<TicketNavbarContainer {...minProps} />)

        fireEvent.click(getByTestId('TicketNavbarContent-delete'))
        fireEvent.click(getByTestId('DeleteModal-submit'))

        setImmediate(() => {
            expect(minProps.sectionDeleted).toHaveBeenNthCalledWith(1, 1)
            done()
        })
    })
})
