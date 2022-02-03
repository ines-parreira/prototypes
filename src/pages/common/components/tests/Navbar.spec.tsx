import React from 'react'
import {render} from '@testing-library/react'
import userEvent, {TargetElement} from '@testing-library/user-event'
import {fromJS, Map} from 'immutable'

import {DEFAULT_PREFERENCES} from '../../../../config'
import {proPlan, advancedPlan} from '../../../../fixtures/subscriptionPlan'
import {user} from '../../../../fixtures/users'
import {Navbar} from '../Navbar'

jest.mock('lodash/uniqueId', () => (id: string) => `${id}42`)

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
        const {container} = render(<Navbar {...minProps} isOpenedPanel />)

        userEvent.click(
            container.getElementsByClassName('slider')[0] as TargetElement
        )
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
        window.noticeable = {
            on: jest.fn(),
            render: () => Promise.resolve(),
            destroy: () => Promise.resolve(),
        }
        const {getByText} = render(<Navbar {...minProps} />)

        userEvent.click(getByText(user.name))
        expect(document.getElementsByClassName('show')).toHaveLength(2)
    })
})
