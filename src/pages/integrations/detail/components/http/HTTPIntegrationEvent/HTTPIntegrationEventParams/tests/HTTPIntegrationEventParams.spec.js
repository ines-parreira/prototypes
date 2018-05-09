import React from 'react'
import HTTPIntegrationEventParams from '../HTTPIntegrationEventParams'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

describe('HTTPIntegrationEventParams', () => {
    it('should not render the component because it has no params', () => {
        const component = shallow(<HTTPIntegrationEventParams/>)
        expect(component).toMatchSnapshot()
    })

    it('should render the given params', () => {
        const component = shallow(
            <HTTPIntegrationEventParams
                params={fromJS({
                    params1: 'value1',
                    params2: 'value2',
                    params3: 'value3',
                })}
            />
        )
        expect(component).toMatchSnapshot()
    })
})
