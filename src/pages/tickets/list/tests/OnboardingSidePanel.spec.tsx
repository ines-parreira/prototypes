import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {RootState} from 'state/types'
import {user} from 'fixtures/users'

import OnboardingSidePanel from '../OnboardingSidePanel'

jest.mock('store/middlewares/segmentTracker')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

const mockStore = configureMockStore()

describe('OnboardingSidePanel', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    const defaultState = {
        currentUser: fromJS({
            ...user,
            created_datetime: new Date().toISOString(),
        }),
    } as RootState

    it(`should greet the user`, () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <OnboardingSidePanel />
            </Provider>
        )

        const title = screen.getByRole('heading', {level: 1})

        expect(title.textContent).toBe('WelcomeAlex!')
    })

    it.each([
        {linkText: 'Connect store', eventName: 'Connect a store'},
        {linkText: 'Connect email', eventName: 'Connect an email address'},
        {linkText: 'Enable 2FA', eventName: 'Enable 2FA'},
        {linkText: 'Connect social media', eventName: 'Connect social media'},
        {linkText: 'Add chat widget', eventName: 'Connect chat'},
        {linkText: 'Invite team members', eventName: 'Add team members'},
        {linkText: 'Skip', eventName: 'Hide'},
    ])(
        'should log onboarding-widget-clicked:$eventName event on $linkText link click',
        ({linkText, eventName}) => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <OnboardingSidePanel />
                </Provider>
            )

            fireEvent.click(screen.getByText(linkText))

            expect(logEventMock).toHaveBeenLastCalledWith(
                SegmentEvent.OnboardingWidgetClicked,
                {name: eventName}
            )
        }
    )
})
