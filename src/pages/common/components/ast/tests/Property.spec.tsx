import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import Property from '../Property'

const commonProps = {
    parent: fromJS(['body', 0, 'expression']),
    schemas: fromJS({foo: 'schemas'}),
    theKey: {foo: 'theKey'},
    value: {value: 'foo'},
} as unknown as ComponentProps<typeof Property>

describe('Property component', () => {
    it("should display errors if the validate method of the field's config raises any", () => {
        const component = shallow(
            <Property
                {...commonProps}
                config={{validate: () => 'error!error!'}}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it("should not display errors if the validate method of the field's config does not raise any", () => {
        const component = shallow(
            <Property {...commonProps} config={{validate: () => undefined}} />
        )

        expect(component).toMatchSnapshot()
    })

    it('should not display errors if there is no validate method', () => {
        const component = shallow(<Property {...commonProps} config={{}} />)

        expect(component).toMatchSnapshot()
    })

    it('should render a compact (inline) Property', () => {
        const component = shallow(
            <Property {...commonProps} config={{}} compact={true} />
        )

        expect(component).toMatchSnapshot()
    })
})
