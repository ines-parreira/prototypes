import React from 'react'
import {shallow} from 'enzyme'

import EmojiTextInput from '../EmojiTextInput'

describe('<EmojiTextInput/>', () => {
    let onChange: jest.MockedFunction<any>
    let onEmojiChange: jest.MockedFunction<any>

    beforeEach(() => {
        onChange = jest.fn()
        onEmojiChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const component = shallow(
                <EmojiTextInput
                    id="foo"
                    emoji="🍔"
                    value="Foo"
                    placeholder="Placeholder..."
                    required
                    onChange={onChange}
                    onEmojiChange={onEmojiChange}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})
