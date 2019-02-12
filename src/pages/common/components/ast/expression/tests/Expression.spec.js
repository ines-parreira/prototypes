import React from 'react'
import {shallow} from 'enzyme'

import Expression from '../Expression'

describe('Expression component', () => {
    it('should render UnknownSyntax because the passed type is invalid, and pass all props to child', () => {
        const component = shallow(
            <Expression
                type="unknownType"
                foo="bar"
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should the valid Expression component matching the passed type because it is a valid one', () => {
        const component = shallow(
            <Expression
                type="Literal"
                foo="bar"
            />
        )

        expect(component).toMatchSnapshot()
    })
})
