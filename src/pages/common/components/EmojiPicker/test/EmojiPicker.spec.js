// @flow
import React from 'react'
import {shallow} from 'enzyme'

import EmojiPicker from '../EmojiPicker'

describe('<EmojiPicker/>', () => {
    describe('.render()', () => {
        it('should pass props to Picker component', () => {
            const wrapper = shallow(
                <EmojiPicker
                    style={{color: 'blue'}}
                />
            )
            expect(wrapper).toMatchSnapshot()
        })
    })
})
