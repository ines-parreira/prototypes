import React from 'react'
import {shallow} from 'enzyme'
import Property from '../Property'
import {fromJS} from 'immutable'

const commonProps = {
    parent: fromJS(['body', 0, 'expression']),
    schemas: {foo: 'schemas'},
    theKey: {foo: 'theKey'},
    value: {value: 'foo'}
}


describe('Property component', () => {
    it('should display errors if the validate method of the field\'s config raises any', () => {
        const component = shallow(
            <Property
                {...commonProps}
                config={{validate: () => 'error!error!'}}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not display errors if the validate method of the field\'s config does not raise any', () => {
        const component = shallow(
            <Property
                {...commonProps}
                config={{validate: () => undefined}}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not display errors if there is no validate method', () => {
        const component = shallow(
            <Property
                {...commonProps}
                config={{}}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render a compact (inline) Property', () => {
        const component = shallow(
            <Property
                {...commonProps}
                config={{}}
                compact={true}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
