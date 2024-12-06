import {within} from '@testing-library/dom'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import React from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {DEFAULT_PREFERENCES} from 'config'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    advancedMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
} from 'fixtures/productPrices'
import {user} from 'fixtures/users'
import CreateTicketNavbarButton from 'pages/common/components/CreateTicket/CreateTicketNavbarButton'
import {THEME_NAME} from 'theme'
import type {ColorTokens} from 'theme'
import * as utils from 'utils'
import {getLDClient} from 'utils/launchDarkly'

import {Navbar} from '../Navbar'
import PlaceCallNavbarButton from '../PlaceCallNavbarButton'

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)
jest.mock('common/segment')
jest.mock('utils/launchDarkly')
jest.mock('pages/common/components/CreateTicket/CreateTicketNavbarButton')
jest.mock('pages/common/components/PlaceCallNavbarButton')
jest.mock('common/notifications/components/Button', () => ({
    __esModule: true,
    default: () => <div>NotificationsButton</div>,
}))
const MockedCreateTicketNavbarButton = CreateTicketNavbarButton as jest.Mock
const MockedPlaceCallNavbarButton = PlaceCallNavbarButton as jest.Mock

const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({})

const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

const pageTitleTestCases = [['Tickets'], ['Customers']]

describe('<Navbar />', () => {
    const minProps = {
        activeContent: undefined,
        available: true,
        children: null,
        closePanels: jest.fn(),
        currentHelpdeskProduct: advancedMonthlyHelpdeskPlan,
        currentUser: fromJS(user),
        currentUserPreferences: fromJS({
            type: 'preferences',
            data: DEFAULT_PREFERENCES,
        }),
        isOpenedPanel: false,
        isTrialing: false,
        submitSetting: jest.fn(),
        isPreferencesLoading: false,
        flags: {},
        setTheme: jest.fn(),
        theme: {
            name: THEME_NAME.Classic,
            resolvedName: THEME_NAME.Classic,
            tokens: {} as ColorTokens,
        },
    }

    window.noticeable = {
        on: jest.fn(),
        do: jest.fn(),
        render: jest.fn(() => Promise.resolve()),
        destroy: jest.fn(() => Promise.resolve()),
    }

    beforeEach(() => {
        MockedCreateTicketNavbarButton.mockImplementation(() => (
            <div>CreateTicketNavbarButton</div>
        ))
        MockedPlaceCallNavbarButton.mockImplementation(() => (
            <div>PlaceCallNavbarButton</div>
        ))
    })

    afterEach(() => {
        allFlagsMock.mockReturnValue({})
    })

    it('should render the navbar', () => {
        const {container} = render(<Navbar {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the split ticket view toggle', () => {
        const {container} = render(
            <Navbar
                splitTicketViewToggle={<button>Split ticket view</button>}
                {...minProps}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the title', () => {
        const {getAllByText} = render(
            <Navbar {...minProps} activeContent="tickets" />
        )
        expect(getAllByText('Tickets')).toHaveLength(2)
    })

    it('should render the opened panel', () => {
        const {container} = render(<Navbar {...minProps} isOpenedPanel />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the user as unavailable', () => {
        const {container} = render(<Navbar {...minProps} available={false} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should toggle the user availability when clicking the availability toggle', () => {
        const {getByText} = render(<Navbar {...minProps} isOpenedPanel />)

        userEvent.click(getByText(user.name))
        userEvent.click(getByText(/available/i))
        expect(minProps.submitSetting).toHaveBeenCalledWith(
            {
                data: {
                    available: false,
                    show_macros: false,
                    prefill_best_macro: true,
                },
                type: 'preferences',
            },
            false
        )
    })

    it('should not render additional item to book office hours if FF is disabled', () => {
        const {getByText, queryByText} = render(
            <Navbar
                {...minProps}
                currentHelpdeskProduct={proMonthlyHelpdeskPlan}
                flags={{
                    [FeatureFlagKey.OfficeHours]: false,
                }}
            />
        )

        userEvent.click(getByText(user.name))
        expect(queryByText(/book office hours/i)).not.toBeInTheDocument()
    })

    it('should not render item to book office hours for trialing customers', () => {
        const {queryByText, getByText} = render(
            <Navbar
                {...minProps}
                currentHelpdeskProduct={proMonthlyHelpdeskPlan}
                isTrialing={true}
            />
        )

        userEvent.click(getByText(user.name))
        expect(queryByText(/book office hours/i)).not.toBeInTheDocument()
    })

    it.each([
        ['your profile', 'your-profile', {}, () => {}],
        [
            'book office hours',
            'office-hours',
            {
                flags: {
                    [FeatureFlagKey.OfficeHours]: true,
                },
                currentHelpdeskProduct: proMonthlyHelpdeskPlan,
            },
            () => {},
        ],
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
            render(<Navbar {...minProps} {...props} />)

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
        const {getAllByRole} = render(
            <Navbar
                {...minProps}
                currentHelpdeskProduct={proMonthlyHelpdeskPlan}
                isTrialing={true}
                currentUser={fromJS({
                    ...user,
                    name: '',
                })}
            />
        )

        const {getByText} = within(getAllByRole('button')[2])

        expect(getByText(user.email)).toBeInTheDocument()
    })

    it('should render the noticeable widget when the user menu displays the updates', () => {
        const {getByText} = render(<Navbar {...minProps} />)

        userEvent.click(getByText(user.name))
        userEvent.click(getByText(/gorgias updates/i))

        expect(window.noticeable.render).toHaveBeenCalled()
        expect(window.noticeable.on).toHaveBeenCalled()
    })

    it('should not render the noticeable widget when it has already been rendered', () => {
        const {getByText} = render(<Navbar {...minProps} />)

        userEvent.click(getByText(user.name))
        userEvent.click(getByText(/gorgias updates/i))
        userEvent.click(getByText(user.name))
        userEvent.click(getByText(user.name))

        expect(window.noticeable.render).toHaveBeenCalledTimes(1)
    })

    it('should reopen the user menu at the initial main screen', () => {
        const {getByText, queryByText} = render(<Navbar {...minProps} />)

        userEvent.click(getByText(user.name))
        userEvent.click(getByText(/gorgias updates/i))
        userEvent.click(getByText(user.name))

        expect(queryByText(/your profile/i)).not.toBeInTheDocument()

        userEvent.click(getByText(user.name))

        expect(getByText(/your profile/i)).toBeInTheDocument()
    })

    it('should render Automate', () => {
        jest.spyOn(utils, 'hasRole').mockReturnValue(true)

        const {getByText} = render(<Navbar {...minProps} />)

        expect(getByText('Automate')).toBeInTheDocument()
    })

    it('should not render Automate if not have Agent privilege', () => {
        jest.spyOn(utils, 'hasRole').mockReturnValue(false)
        const {queryByText} = render(<Navbar {...minProps} />)

        expect(queryByText('Automate')).not.toBeInTheDocument()
    })

    it('should render Convert', () => {
        jest.spyOn(utils, 'hasRole').mockReturnValue(true)

        const {getByText} = render(<Navbar {...minProps} />)

        expect(getByText('Convert')).toBeInTheDocument()
    })

    it('should not render Convert if not have Admin privilege', () => {
        jest.spyOn(utils, 'hasRole').mockReturnValue(false)
        const {queryByText} = render(<Navbar {...minProps} />)

        expect(queryByText('Convert')).not.toBeInTheDocument()
    })

    it.each(pageTitleTestCases)(
        'should render CreateTicketNavbarButton and PlaceCallNavbarButton if on a ticket page',
        (title) => {
            const {queryByText} = render(
                <Navbar {...minProps} activeContent={title} />
            )

            if (title === 'Tickets') {
                expect(
                    queryByText(`CreateTicketNavbarButton`)
                ).toBeInTheDocument()
                expect(queryByText(`PlaceCallNavbarButton`)).toBeInTheDocument()
            } else {
                expect(
                    queryByText(`CreateTicketNavbarButton`)
                ).not.toBeInTheDocument()
                expect(
                    queryByText(`PlaceCallNavbarButton`)
                ).not.toBeInTheDocument()
            }
        }
    )
})
