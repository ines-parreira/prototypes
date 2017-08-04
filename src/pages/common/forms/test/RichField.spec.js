import React from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import RichField from '../RichField'

// mock random key generation so they match from a snapshot to the other
jest.mock('draft-js/lib/generateRandomKey', () => () => '123')

describe('RichField', () => {
    it('should render a basic input', () => {
        const component = shallow(
            <RichField
                value={{text: 'text', html: 'html'}}
                onChange={_noop}
            />
        )
        expect(component).toMatchSnapshot()
    })

    it('display alert', () => {
        const component = shallow(
            <RichField
                value={{text: 'text', html: 'html'}}
                onChange={_noop}
                alertMode="warning"
                alertText="alert"
            />
        )
        expect(component).toMatchSnapshot()
    })
})
