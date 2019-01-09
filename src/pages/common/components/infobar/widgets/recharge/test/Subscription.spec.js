import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import {AfterTitle} from '../Subscription'


describe('Subscription', () => {
    describe('AfterTitle', () => {
        it('should display only the cancel action because the subscription is not cancelled', () => {
            const component = shallow((
                <AfterTitle
                    isEditing={false}
                    source={fromJS({})}
                />
            ), {
                context: {
                    isSubscriptionCancelled: false,
                    integrationId: 1
                }
            })

            expect(component).toMatchSnapshot()
        })

        it('should display only the activate action because the subscription is cancelled', () => {
            const component = shallow((
                <AfterTitle
                    isEditing={false}
                    source={fromJS({})}
                />
            ), {
                context: {
                    isSubscriptionCancelled: true,
                    integrationId: 1
                }
            })

            expect(component).toMatchSnapshot()
        })
    })
})
