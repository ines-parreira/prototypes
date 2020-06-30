import React from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import ColorField from '../ColorField'

describe('ColorField', () => {
    it('should render a basic color input', () => {
        const component = shallow(<ColorField value="value" onChange={_noop} />)
        expect(component).toMatchSnapshot()
    })
})
