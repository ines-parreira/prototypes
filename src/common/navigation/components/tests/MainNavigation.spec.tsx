import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import type {ReactNode} from 'react'
import {StaticRouter} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'common/segment'
import {UserRole} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import {getCurrentUser} from 'state/currentUser/selectors'
import {closePanels} from 'state/layout/actions'
import {assumeMock} from 'utils/testing'

import MainNavigation, {ActiveContent} from '../MainNavigation'

jest.mock(
    'common/segment',
    () =>
        ({
            ...jest.requireActual('common/segment'),
            logEvent: jest.fn(),
        }) as typeof import('common/segment')
)

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

jest.mock('state/currentUser/selectors', () => ({getCurrentUser: jest.fn()}))
const getCurrentUserMock = assumeMock(getCurrentUser)

jest.mock('state/layout/actions', () => ({closePanels: jest.fn()}))

const wrapper = ({children}: {children: ReactNode}) => (
    <StaticRouter location="/app">{children}</StaticRouter>
)

describe('MainNavigation', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        getCurrentUserMock.mockReturnValue(
            fromJS({role: {name: UserRole.BasicAgent}})
        )
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
    })

    it('should log an event and close panels when a menu item is clicked', () => {
        const {getByText} = render(
            <MainNavigation activeContent={ActiveContent.Settings} />,
            {wrapper}
        )
        const el = getByText('Tickets')
        expect(el).toBeInTheDocument()
        fireEvent.click(el)
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.MenuMainLinkClicked,
            {link: 'tickets'}
        )
        expect(closePanels).toHaveBeenCalled()
        expect(dispatch).toHaveBeenCalled()
    })

    it('should render the title based on the active content', () => {
        const {getAllByText} = render(
            <MainNavigation activeContent={ActiveContent.Tickets} />,
            {wrapper}
        )
        const el = getAllByText('Tickets')[0]
        expect(el).toBeInTheDocument()
        expect(el.tagName.toLowerCase()).toBe('div')
    })

    it('should render the tickets menu item', () => {
        const {getByText} = render(
            <MainNavigation activeContent={ActiveContent.Settings} />,
            {wrapper}
        )
        expect(getByText('Tickets')).toBeInTheDocument()
    })

    it('should not render the automate menu item for basic agents', () => {
        const {queryByText} = render(
            <MainNavigation activeContent={ActiveContent.Tickets} />,
            {wrapper}
        )
        expect(queryByText('Automate')).not.toBeInTheDocument()
    })

    it('should render the automate menu item for lead agents', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({role: {name: UserRole.Agent}})
        )
        const {getByText} = render(
            <MainNavigation activeContent={ActiveContent.Tickets} />,
            {wrapper}
        )
        expect(getByText('Automate')).toBeInTheDocument()
    })

    it('should not render the convert menu item for non-admins', () => {
        const {queryByText} = render(
            <MainNavigation activeContent={ActiveContent.Tickets} />,
            {wrapper}
        )
        expect(queryByText('Convert')).not.toBeInTheDocument()
    })

    it('should render the convert menu item for admins', () => {
        getCurrentUserMock.mockReturnValue(
            fromJS({role: {name: UserRole.Admin}})
        )
        const {getByText} = render(
            <MainNavigation activeContent={ActiveContent.Tickets} />,
            {wrapper}
        )
        expect(getByText('Convert')).toBeInTheDocument()
    })

    it('should render the customers menu item', () => {
        const {getByText} = render(
            <MainNavigation activeContent={ActiveContent.Tickets} />,
            {wrapper}
        )
        expect(getByText('Customers')).toBeInTheDocument()
    })

    it('should render the statistics menu item', () => {
        const {getByText} = render(
            <MainNavigation activeContent={ActiveContent.Tickets} />,
            {wrapper}
        )
        expect(getByText('Statistics')).toBeInTheDocument()
    })

    it('should render the settings menu item', () => {
        const {getByText} = render(
            <MainNavigation activeContent={ActiveContent.Tickets} />,
            {wrapper}
        )
        expect(getByText('Settings')).toBeInTheDocument()
    })
})
