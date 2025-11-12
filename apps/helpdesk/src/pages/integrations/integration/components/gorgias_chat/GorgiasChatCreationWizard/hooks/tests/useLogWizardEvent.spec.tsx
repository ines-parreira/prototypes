import React from 'react'

import * as SegmentTracker from '@repo/logging'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from 'models/integration/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import { renderWithRouter } from 'utils/testing'

import useLogWizardEvent from '../useLogWizardEvent'

const mockStore = configureMockStore([thunk])

const defaultState = {
    currentAccount: fromJS({
        domain: 'test-domain',
    }),
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                meta: {
                    shop_type: IntegrationType.Shopify,
                },
            },
        ],
    }),
}

const TestComponent = () => {
    const logWizardEvent = useLogWizardEvent()

    logWizardEvent(SegmentTracker.SegmentEvent.ChatWidgetWizardStepStarted, {
        foo: 'bar',
    })

    return null
}

describe('useLogWizardEvent()', () => {
    it('should log the event', () => {
        const spy = jest.spyOn(SegmentTracker, 'logEvent')

        renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <Wizard steps={['step1']} startAt="step1">
                    <WizardStep name="step1">
                        <TestComponent />
                    </WizardStep>
                </Wizard>
            </Provider>,
            {
                path: '/:integrationId',
                route: '/1',
            },
        )

        expect(spy).toHaveBeenCalledWith(
            SegmentTracker.SegmentEvent.ChatWidgetWizardStepStarted,
            {
                step: 'step1',
                account_domain: 'test-domain',
                shop_type: 'shopify',
                foo: 'bar',
            },
        )
    })
})
