import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import React from 'react'
import type {ComponentProps, ReactNode} from 'react'
import {StaticRouter} from 'react-router-dom'

import {ActiveContent} from 'common/navigation'
import {logEvent, SegmentEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {user} from 'fixtures/users'
import {THEME_NAME} from 'theme'
import type {ColorTokens} from 'theme'
import {getLDClient} from 'utils/launchDarkly'

import {Navbar} from '../Navbar'
import css from '../Navbar.less'

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)
jest.mock('common/segment')

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

const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock(
    'common/navigation',
    () =>
        ({
            ...jest.requireActual('common/navigation'),
            AvailabilityToggle: () => <div>AvailabilityToggle</div>,
            MainNavigation: () => <div>main navigation</div>,
            OfficeHours: () => <div>OfficeHours</div>,
            ThemeMenu: () => <div>ThemeMenu</div>,
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
        available: true,
        children: null,
        closePanels: jest.fn(),
        currentUser: fromJS(user),
        isMobileResolution: false,
        isOpenedPanel: false,
        setTheme: jest.fn(),
        theme: {
            name: THEME_NAME.Classic,
            resolvedName: THEME_NAME.Classic,
            tokens: {} as ColorTokens,
        },
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

    it('should render the opened panel', () => {
        const {container} = render(<Navbar {...minProps} isOpenedPanel />, {
            wrapper,
        })
        expect(
            container.querySelector(`.${css['hidden-panel']}`)
        ).not.toBeInTheDocument()
    })

    it('should render the user as unavailable', () => {
        const {container} = render(<Navbar {...minProps} available={false} />, {
            wrapper,
        })
        const el = container.querySelector('.dropdown-toggle-dropup .badge')
        expect(el).toHaveStyle({'background-color': 'rgb(255, 150, 0)'})
    })

    it('should render the availability toggle', () => {
        const {getByText} = render(<Navbar {...minProps} />, {wrapper})
        userEvent.click(getByText(user.name))
        expect(getByText('AvailabilityToggle')).toBeInTheDocument()
    })

    it('should render the office hours', () => {
        const {getByText} = render(<Navbar {...minProps} />, {wrapper})

        userEvent.click(getByText(user.name))
        expect(getByText('OfficeHours')).toBeInTheDocument()
    })

    it.each([
        ['your profile', 'your-profile', {}, () => {}],
        ['refer a friend & earn', 'referral-program', {}, () => {}],
        ['log out', 'log-out', {}, () => {}],
        [
            'help center',
            'helpdocs',
            {},
            () => {
                userEvent.click(screen.getByText(/learn/i))
            },
        ],
        [
            'gorgias webinars',
            'gorgiaswebinars',
            {},
            () => {
                userEvent.click(screen.getByText(/learn/i))
            },
        ],
        [
            'gorgias academy',
            'gorgiasacademy',
            {},
            () => {
                userEvent.click(screen.getByText(/learn/i))
            },
        ],
        [
            'gorgias community',
            'gorgiascommunity',
            {},
            () => {
                userEvent.click(screen.getByText(/learn/i))
            },
        ],
        [
            'keyboard shortcuts',
            'keyboard-shortcuts',
            {},
            () => {
                userEvent.click(screen.getByText(/learn/i))
            },
        ],
        [
            'latest updates',
            'latest-updates',
            {},
            () => {
                userEvent.click(screen.getByText(/gorgias updates/i))
            },
        ],
        [
            'roadmap',
            'roadmap',
            {},
            () => {
                userEvent.click(screen.getByText(/gorgias updates/i))
            },
        ],
        [
            'service status',
            'service-status',
            {},
            () => {
                userEvent.click(screen.getByText(/gorgias updates/i))
            },
        ],
    ])(
        `should log ${SegmentEvent.MenuUserLinkClicked} event clicking on %s dropdown item`,
        (text, segmentValue, props, extraActions) => {
            render(<Navbar {...minProps} {...props} />, {wrapper})

            userEvent.click(screen.getByText(user.name))
            extraActions()
            userEvent.click(screen.getByText(new RegExp(text, 'i')))

            expect(logEventMock).toHaveBeenLastCalledWith(
                SegmentEvent.MenuUserLinkClicked,
                {
                    link: segmentValue,
                }
            )
        }
    )

    it('should fallback user name to email', () => {
        const {getByText} = render(
            <Navbar
                {...minProps}
                currentUser={fromJS({
                    ...user,
                    name: '',
                })}
            />,
            {wrapper}
        )

        expect(getByText(user.email)).toBeInTheDocument()
    })

    it('should render the noticeable widget when the user menu displays the updates', () => {
        const {getByText} = render(<Navbar {...minProps} />, {wrapper})

        userEvent.click(getByText(user.name))
        userEvent.click(getByText(/gorgias updates/i))
        expect(getByText('NoticeableIndicator')).toBeInTheDocument()
    })

    it('should reopen the user menu at the initial main screen', () => {
        const {getByText, queryByText} = render(<Navbar {...minProps} />, {
            wrapper,
        })

        userEvent.click(getByText(user.name))
        userEvent.click(getByText(/gorgias updates/i))
        userEvent.click(getByText(user.name))

        expect(queryByText(/your profile/i)).not.toBeInTheDocument()

        userEvent.click(getByText(user.name))

        expect(getByText(/your profile/i)).toBeInTheDocument()
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
