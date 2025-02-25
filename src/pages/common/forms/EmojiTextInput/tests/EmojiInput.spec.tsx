import React from 'react'

import { render } from '@testing-library/react'

import EmojiTextInput from '../EmojiTextInput'

jest.mock('../../input/TextInput', () =>
    jest.fn(() => (
        <div>
            <p>TextInput</p>
            <input />
        </div>
    )),
)
jest.mock('pages/common/components/ViewTable/EmojiSelect/EmojiSelect', () =>
    jest.fn(() => <div>EmojiSelect</div>),
)

describe('<EmojiTextInput/>', () => {
    let onChange: jest.MockedFunction<any>
    let onEmojiChange: jest.MockedFunction<any>

    beforeEach(() => {
        onChange = jest.fn()
        onEmojiChange = jest.fn()
    })

    describe('render()', () => {
        it('should render', () => {
            const { getByText } = render(
                <EmojiTextInput
                    id="foo"
                    emoji="🍔"
                    value="Foo"
                    placeholder="Placeholder..."
                    required
                    onChange={onChange}
                    onEmojiChange={onEmojiChange}
                />,
            )

            expect(getByText('TextInput')).toBeInTheDocument()
            expect(getByText('EmojiSelect')).toBeInTheDocument()
        })

        it('should render error', () => {
            const { getByText } = render(
                <EmojiTextInput
                    id="foo"
                    emoji="🍔"
                    value="Foo"
                    placeholder="Placeholder..."
                    required
                    error="Error"
                    onChange={onChange}
                    onEmojiChange={onEmojiChange}
                />,
            )

            expect(getByText('Error')).toBeInTheDocument()
        })
    })
})
