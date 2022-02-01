import React, {ComponentProps} from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'

import JsonField from '../JsonField'

describe('JsonField', () => {
    const minProps: ComponentProps<typeof JsonField> = {
        value: 'value',
        onChange: _noop,
    }

    it('should render input', () => {
        const component = mount(<JsonField {...minProps} />)
        expect(component).toMatchSnapshot()
    })

    it('display invalid message', () => {
        const component = shallow(<JsonField {...minProps} />)
        component.setState({isJsonValid: false})
        expect(component).toMatchSnapshot()
    })
})
