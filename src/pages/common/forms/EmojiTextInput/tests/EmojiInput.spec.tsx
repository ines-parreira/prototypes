import {render} from '@testing-library/react'
import React from 'react'

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
            const {container} = render(
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

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
