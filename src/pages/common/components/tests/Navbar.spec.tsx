import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import {within} from '@testing-library/dom'

import {DEFAULT_PREFERENCES} from 'config'
import {user} from 'fixtures/users'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getLDClient} from 'utils/launchDarkly'
import {FeatureFlagKey} from 'config/featureFlags'

import {
    advancedMonthlyHelpdeskPrice,
    proMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'

import {Navbar} from '../Navbar'

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)
jest.mock('store/middlewares/segmentTracker')
jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({})

const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

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
    }

    window.noticeable = {
        on: jest.fn(),
        do: jest.fn(),
        render: jest.fn(() => Promise.resolve()),
        destroy: jest.fn(() => Promise.resolve()),
    }

    afterEach(() => {
        jest.clearAllMocks()
        allFlagsMock.mockReturnValue({})
    })

    it('should render the navbar', () => {
        const {container} = render(<Navbar {...minProps} />)
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

        const {getByText} = within(getAllByRole('button')[1])

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

    it('should render the spotlight search if enabled', () => {
        allFlagsMock.mockReturnValue({
            [FeatureFlagKey.SpotlightGlobalSearch]: true,
        })

        const {container} = render(<Navbar {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
