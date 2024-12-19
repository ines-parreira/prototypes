import {render} from '@testing-library/react'
import React from 'react'

import {useFlag} from 'common/flags'
import {ActiveContent} from 'common/navigation'
import useAppSelector from 'hooks/useAppSelector'
import {assumeMock} from 'utils/testing'

import Navbar from '../Navbar'
import css from '../Navbar.less'

jest.mock('common/flags', () => ({useFlag: jest.fn()}))
const useFlagMock = assumeMock(useFlag)

jest.mock('common/notifications', () => ({
    NotificationsButton: () => <div>NotificationsButton</div>,
}))

jest.mock('common/segment')
jest.mock('hooks/useAppSelector', () => jest.fn())
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock(
    'pages/common/components/CreateTicket/CreateTicketNavbarButton',
    () => () => <div>CreateTicketNavbarButton</div>
)
jest.mock('pages/common/components/PlaceCallNavbarButton', () => () => (
    <div>PlaceCallNavbarButton</div>
))
jest.mock(
    '../MainNavigation',
    () =>
        ({
            ...jest.requireActual('../MainNavigation'),
            default: () => <div>MainNavigation</div>,
        }) as typeof import('../MainNavigation')
)
jest.mock('../UserMenuWithToggle', () => () => <div>UserMenuWithToggle</div>)

describe('Navbar', () => {
    const props = {
        activeContent: ActiveContent.Tickets,
        children: null,
        title: '',
    }

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(false)
        useFlagMock.mockReturnValue(false)
    })

    it('should set the navbar width if resizing is not disabled', () => {
        const {container} = render(<Navbar {...props} />)
        expect(container.firstChild).toHaveStyle('width: 238px')
    })

    it('should not set the navbar width if resizing is disabled', () => {
        const {container} = render(<Navbar {...props} />)
        expect(container.firstChild).not.toHaveStyle('width:')
    })

    it('should render the main navigation if the user does not have the global nav flag', () => {
        const {getByText} = render(<Navbar {...props} />)
        expect(getByText('MainNavigation')).toBeInTheDocument()
    })

    it('should render the title if the user has the global nav flag', () => {
        useFlagMock.mockReturnValue(true)
        const {getByText} = render(
            <Navbar {...props} title="beep-boop-title" />
        )
        expect(getByText('beep-boop-title')).toBeInTheDocument()
    })

    it('should render the split ticket view toggle', () => {
        const {getByText} = render(
            <Navbar
                {...props}
                splitTicketViewToggle={<button>SplitTicketView</button>}
            />
        )
        expect(getByText('SplitTicketView')).toBeInTheDocument()
    })

    it('should hide the navigation when the panel is opened', () => {
        const {container} = render(<Navbar {...props} />)
        expect(
            container.querySelector(`.${css['hidden-panel']}`)
        ).toBeInTheDocument()
    })

    it('should show the navigation when the panel is opened', () => {
        useAppSelectorMock.mockReturnValue(true)
        const {container} = render(<Navbar {...props} />)
        expect(
            container.querySelector(`.${css['hidden-panel']}`)
        ).not.toBeInTheDocument()
    })

    it('should render header content if given', () => {
        const {getByText} = render(
            <Navbar {...props} headerContent={<div>HeaderContent</div>} />
        )
        expect(getByText('HeaderContent')).toBeInTheDocument()
    })

    it('should show the user menu if the user does not have the global nav flag', () => {
        const {getByText} = render(
            <Navbar {...props} activeContent={ActiveContent.Settings} />
        )
        expect(getByText('UserMenuWithToggle')).toBeInTheDocument()
    })

    it('should hide the user menu if the user has the global nav flag', () => {
        useFlagMock.mockReturnValue(true)
        const {queryByText} = render(<Navbar {...props} />)
        expect(queryByText('UserMenuWithToggle')).not.toBeInTheDocument()
    })
})
