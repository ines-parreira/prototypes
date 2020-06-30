import {shallow} from 'enzyme'
import React from 'react'
import {fromJS} from 'immutable'

import HTTPIntegrationLayout from '../HTTPIntegrationLayout'

const HTTPintegration = fromJS({
    id: 1,
    name: 'Backend integration',
})

describe('HTTPIntegrationLayout', () => {
    it('should render layout for a new HTTP integration', () => {
        const component = shallow(
            <HTTPIntegrationLayout
                integration={fromJS({})}
                isUpdate={false}
                urlParams={{}}
            >
                <span>children</span>
            </HTTPIntegrationLayout>
        )
        expect(component).toMatchSnapshot()
    })

    it('should render the layout of the settings page of a HTTP integration', () => {
        const component = shallow(
            <HTTPIntegrationLayout
                integration={HTTPintegration}
                isUpdate={true}
                urlParams={{}}
            >
                <span>children</span>
            </HTTPIntegrationLayout>
        )
        expect(component).toMatchSnapshot()
    })

    it('should render the layout of the events page of a HTTP integration', () => {
        const component = shallow(
            <HTTPIntegrationLayout
                integration={HTTPintegration}
                isUpdate={true}
                urlParams={{extra: 'events'}}
            >
                <span>children</span>
            </HTTPIntegrationLayout>
        )
        expect(component).toMatchSnapshot()
    })

    it('should render the layout of an event page of a HTTP integration', () => {
        const component = shallow(
            <HTTPIntegrationLayout
                integration={HTTPintegration}
                isUpdate={true}
                urlParams={{
                    extra: 'events',
                    subId: '2',
                }}
            >
                <span>children</span>
            </HTTPIntegrationLayout>
        )
        expect(component).toMatchSnapshot()
    })
})
