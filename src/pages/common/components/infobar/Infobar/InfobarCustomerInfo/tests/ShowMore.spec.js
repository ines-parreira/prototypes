import React from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import {ShowMore} from '../ShowMore.tsx'

describe('<ShowMore/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const component = shallow(
                <ShowMore className="foo" onClick={_noop}>
                    Show more
                </ShowMore>
            )

            expect(component).toMatchSnapshot()
        })
    })
})
