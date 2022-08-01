import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS, Map} from 'immutable'
import {within} from '@testing-library/dom'

import {DEFAULT_PREFERENCES} from '../../../../config'
import {proPlan, advancedPlan} from '../../../../fixtures/subscriptionPlan'
import {user} from '../../../../fixtures/users'
import {Navbar} from '../Navbar'

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

describe('<Navbar />', () => {
    const minProps = {
        activeContent: undefined,
        available: true,
        children: null,
        closePanels: jest.fn(),
        currentPlan: fromJS(advancedPlan) as Map<any, any>,
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
                data: {available: false, show_macros: false},
                type: 'preferences',
            },
            false
        )
    })

    it('should render additional item to book office hours', () => {
        const {getByText} = render(
            <Navbar {...minProps} currentPlan={fromJS(proPlan)} />
        )

        userEvent.click(getByText(user.name))
        expect(getByText(/book office hours/i)).toBeTruthy()
    })

    it('should not render item to book office hours for trialing customers', () => {
        const {queryByText} = render(
            <Navbar
                {...minProps}
                currentPlan={fromJS(proPlan)}
                isTrialing={true}
            />
        )
        expect(queryByText(/book office hours/i)).toBeFalsy()
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
                currentPlan={fromJS(proPlan)}
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
})
