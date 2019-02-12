import React from 'react'
import {shallow} from 'enzyme'

import HTTPIntegrationEventItem from '../HTTPIntegrationEventItem'

describe('HTTPIntegrationEventItem', () => {
    it('should render its name with an empty label because it has no value and children', () => {
        const component = shallow(
            <HTTPIntegrationEventItem name="foo"/>
        )
        expect(component).toMatchSnapshot()
    })

    it('should render its name with an empty label because its value equals `null`', () => {
        const component = shallow(
            <HTTPIntegrationEventItem
                name="foo"
                value={null}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render its name with an empty label because its value equals `null` (even with a children)', () => {
        const component = shallow(
            <HTTPIntegrationEventItem
                name="foo"
                value={null}
            >
                <span>bar</span>
            </HTTPIntegrationEventItem>
        )
        expect(component).toMatchSnapshot()
    })

    it('should render its name with its children', () => {
        const component = shallow(
            <HTTPIntegrationEventItem name="foo">
                <span>bar</span>
            </HTTPIntegrationEventItem>
        )
        expect(component).toMatchSnapshot()
    })

    it('should render its name with its children instead of displaying its value', () => {
        const component = shallow(
            <HTTPIntegrationEventItem
                name="foo"
                value="bar"
            >
                <span>bar</span>
            </HTTPIntegrationEventItem>
        )
        expect(component).toMatchSnapshot()
    })
})
