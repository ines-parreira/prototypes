import React from 'react'
import {shallow} from 'enzyme'

import Expression from '../Expression'

describe('Expression component', () => {
    it('should render UnknownSyntax because the passed type is invalid, and pass all props to child', () => {
        //@ts-ignore
        const component = shallow(<Expression type="unknownType" />)

        expect(component).toMatchSnapshot()
    })

    it('should render the valid Expression component matching the passed type because it is a valid one', () => {
        //@ts-ignore
        const component = shallow(<Expression type="Literal" />)

        expect(component).toMatchSnapshot()
    })
})
