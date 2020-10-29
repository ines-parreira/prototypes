import {render} from '@testing-library/react'
import React from 'react'

import EmojiPicker from '../EmojiPicker'

describe('<EmojiPicker/>', () => {
    describe('.render()', () => {
        it('should pass props to Picker component', () => {
            const {container} = render(
                <EmojiPicker className="foo" style={{color: 'blue'}} />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
