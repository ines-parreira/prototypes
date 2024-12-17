import {render} from '@testing-library/react'
import React from 'react'
import type {ComponentProps, ReactNode} from 'react'
import {StaticRouter} from 'react-router-dom'

import {ActiveContent} from 'common/navigation'
import {FeatureFlagKey} from 'config/featureFlags'
import {getLDClient} from 'utils/launchDarkly'

import {Navbar} from '../Navbar'
import css from '../Navbar.less'

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

jest.mock(
    'pages/common/components/CreateTicket/CreateTicketNavbarButton',
    () => () => <div>CreateTicketNavbarButton</div>
)
jest.mock('pages/common/components/PlaceCallNavbarButton', () => () => (
    <div>PlaceCallNavbarButton</div>
))

jest.mock('utils/launchDarkly')
jest.mock('common/notifications/components/Button', () => ({
    __esModule: true,
    default: () => <div>NotificationsButton</div>,
}))

const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({})

jest.mock(
    'common/navigation',
    () =>
        ({
            ...jest.requireActual('common/navigation'),
            MainNavigation: () => <div>main navigation</div>,
            UserMenuWithToggle: () => <div>UserMenuWithToggle</div>,
        }) as typeof import('common/navigation')
)

jest.mock('../NoticeableIndicator', () => () => (
    <span>NoticeableIndicator</span>
))

const wrapper = ({children}: {children: ReactNode}) => (
    <StaticRouter location="/app">{children}</StaticRouter>
)

describe('Navbar', () => {
    const minProps: ComponentProps<typeof Navbar> = {
        activeContent: ActiveContent.Tickets,
        children: null,
        isMobileResolution: false,
        isOpenedPanel: false,
        title: '',
    }

    window.noticeable = {
        on: jest.fn(),
        do: jest.fn(),
        render: jest.fn(() => Promise.resolve()),
        destroy: jest.fn(() => Promise.resolve()),
    }

    afterEach(() => {
        allFlagsMock.mockReturnValue({})
    })

    it('should render the title if the user has the global nav flag', () => {
        const {getByText} = render(
            <Navbar
                {...minProps}
                title="beep-boop-title"
                flags={{
                    [FeatureFlagKey.GlobalNavigation]: true,
                }}
            />
        )
        expect(getByText('beep-boop-title')).toBeInTheDocument()
    })

    it('should render the split ticket view toggle', () => {
        const {getByText} = render(
            <Navbar
                splitTicketViewToggle={<button>Split ticket view</button>}
                {...minProps}
            />,
            {wrapper}
        )
        expect(getByText('Split ticket view')).toBeInTheDocument()
    })

    it('should render the main navigation', () => {
        const {getByText} = render(<Navbar {...minProps} />, {wrapper})
        expect(getByText('main navigation')).toBeInTheDocument()
    })

    it('should render the user menu', () => {
        const {getByText} = render(<Navbar {...minProps} />, {wrapper})
        expect(getByText('UserMenuWithToggle')).toBeInTheDocument()
    })

    it('should render the opened panel', () => {
        const {container} = render(<Navbar {...minProps} isOpenedPanel />, {
            wrapper,
        })
        expect(
            container.querySelector(`.${css['hidden-panel']}`)
        ).not.toBeInTheDocument()
    })

    it.each([['tickets'], ['customers']])(
        'should render CreateTicketNavbarButton and PlaceCallNavbarButton if on a ticket page',
        (content) => {
            const {queryByText} = render(
                <Navbar
                    {...minProps}
                    activeContent={content as ActiveContent}
                />,
                {wrapper}
            )

            if (content === 'tickets') {
                expect(
                    queryByText('CreateTicketNavbarButton')
                ).toBeInTheDocument()
                expect(queryByText('PlaceCallNavbarButton')).toBeInTheDocument()
            } else {
                expect(
                    queryByText('CreateTicketNavbarButton')
                ).not.toBeInTheDocument()
                expect(
                    queryByText('PlaceCallNavbarButton')
                ).not.toBeInTheDocument()
            }
        }
    )
})
