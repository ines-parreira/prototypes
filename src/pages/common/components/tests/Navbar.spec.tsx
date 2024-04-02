import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import {within} from '@testing-library/dom'

import CreateTicketNavbarButton from 'pages/common/components/CreateTicket/CreateTicketNavbarButton'
import {logEvent, SegmentEvent} from 'common/segment'
import {DEFAULT_PREFERENCES} from 'config'
import {user} from 'fixtures/users'
import {getLDClient} from 'utils/launchDarkly'
import {
    advancedMonthlyHelpdeskPrice,
    proMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import * as utils from 'utils'
import {AcceptedThemes, Theme} from 'theme'

import {FeatureFlagKey} from 'config/featureFlags'
import {Navbar} from '../Navbar'

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)
jest.mock('common/segment')
jest.mock('utils/launchDarkly')
jest.mock('pages/common/components/CreateTicket/CreateTicketNavbarButton')
const MockedCreateTicketNavbarButton = CreateTicketNavbarButton as jest.Mock

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
        currentHelpdeskProduct: advancedMonthlyHelpdeskPrice,
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
        savedTheme: Theme.Modern,
        theme: Theme.Modern as AcceptedThemes,
        setTheme: jest.fn(),
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

    it('should render additional item to book office hours', () => {
        const {getByText} = render(
            <Navbar
                {...minProps}
                currentHelpdeskProduct={proMonthlyHelpdeskPrice}
            />
        )

        userEvent.click(getByText(user.name))
        expect(getByText(/book office hours/i)).toBeTruthy()
    })

    it('should not render item to book office hours for trialing customers', () => {
        const {queryByText, getByText} = render(
            <Navbar
                {...minProps}
                currentHelpdeskProduct={proMonthlyHelpdeskPrice}
                isTrialing={true}
            />
        )

        userEvent.click(getByText(user.name))
        expect(queryByText(/book office hours/i)).toBeFalsy()
    })

    it(`should log ${SegmentEvent.MenuUserLinkClicked} event on book office hours click`, () => {
        const {getByText} = render(
            <Navbar
                {...minProps}
                currentHelpdeskProduct={proMonthlyHelpdeskPrice}
            />
        )

        userEvent.click(getByText(user.name))
        userEvent.click(getByText(/book office hours/i)!)

        expect(logEventMock).toHaveBeenLastCalledWith(
            SegmentEvent.MenuUserLinkClicked,
            {
                link: 'office-hours',
            }
        )
    })

    it('should toggle the dropdown when clicking on the current logged user', () => {
        const {getByText} = render(<Navbar {...minProps} />)

        userEvent.click(getByText(user.name))
        expect(getByText(/your profile/i)).toBeTruthy()
    })

    it('should fallback user name to email', () => {
        const {getAllByRole} = render(
            <Navbar
                {...minProps}
                currentHelpdeskProduct={proMonthlyHelpdeskPrice}
                isTrialing={true}
                currentUser={fromJS({
                    ...user,
                    name: '',
                })}
            />
        )

        const {getByText} = within(getAllByRole('button')[2])

        expect(getByText(user.email)).toBeTruthy()
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

        expect(queryByText(/your profile/i)).toBeFalsy()

        userEvent.click(getByText(user.name))

        expect(getByText(/your profile/i)).toBeTruthy()
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
        'should render CreateTicketNavbarButton if on a ticket page',
        (title) => {
            const {queryByText} = render(
                <Navbar
                    {...minProps}
                    activeContent={title}
                    flags={{
                        [FeatureFlagKey.SplitTicketView]: true,
                    }}
                />
            )

            title === 'Tickets'
                ? expect(
                      queryByText(`CreateTicketNavbarButton`)
                  ).toBeInTheDocument()
                : expect(
                      queryByText(`CreateTicketNavbarButton`)
                  ).not.toBeInTheDocument()
        }
    )
})
