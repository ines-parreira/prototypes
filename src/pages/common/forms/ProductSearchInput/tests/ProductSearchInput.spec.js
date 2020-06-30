// @flow

import React from 'react'
import {shallow} from 'enzyme'

import ProductSearchInput from '../ProductSearchInput'

describe('<ProductSearchInput/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const context = {integrationId: 1}
            const component = shallow(<ProductSearchInput />, {context})

            expect(component).toMatchSnapshot()
        })
    })
})
