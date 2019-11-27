// @flow
import React from 'react'
import {shallow, mount} from 'enzyme'
import _noop from 'lodash/noop'

import EmojiSelect from '../EmojiSelect'
import css from '../EmojiSelect.less'

const POPOVER_SELECTOR = '.popover'
const EMOJI_MART_EMOJI_SELECTOR = '.emoji-mart-emoji'

const defaultProps = {
    emoji: '1',
    onEmojiSelect: _noop,
    onEmojiClear: _noop
}

afterEach(() => {
    jest.clearAllMocks()
})

// Hide popover by clicking the trigger.
// Erasing the DOM freaks out Popper.js (used by Reactstrap)
afterEach(() => {
    const popover = global.document.querySelector(POPOVER_SELECTOR)
    if (popover) {
        global.document.querySelector('.' + css.icon).click()
    }
})

describe('<EmojiSelect/>', () => {
    describe('.render()', () => {
        it('should show smiley when no emoji selected', () => {
            const wrapper = shallow(
                <EmojiSelect
                    {...defaultProps}
                    emoji={null}
                />
            )
            expect(wrapper).toMatchSnapshot()
        })

        it('show emoji picker on icon click', () => {
            const wrapper = shallow(<EmojiSelect {...defaultProps}/>)
            wrapper.find('.' + css.icon).simulate('click')
            expect(wrapper).toMatchSnapshot()
        })
    })

    describe('onEmojiSelect()', () => {
        it('should call onEmojiSelect on emoji click', () => {
            const onEmojiSelect = jest.spyOn(defaultProps, 'onEmojiSelect')
            const wrapper = mount(<EmojiSelect {...defaultProps}/>)
            wrapper.find('.' + css.icon).simulate('click')
            const emoji = global.document.querySelector(EMOJI_MART_EMOJI_SELECTOR)
            const expectedEmoji = emoji.querySelector('span').innerHTML
            emoji.click()
            expect(onEmojiSelect).toHaveBeenLastCalledWith(expectedEmoji)
        })
    })

    describe('onEmojiClear()', () => {
        it('should call onEmojiClear on clear button click', () => {
            const onEmojiClear = jest.spyOn(defaultProps, 'onEmojiClear')
            const wrapper = mount(<EmojiSelect {...defaultProps}/>)
            wrapper.find('.' + css.icon).simulate('click')
            global.document.querySelector('.' + css.clearButton).click()
            expect(onEmojiClear).toHaveBeenLastCalledWith()
        })
    })
})
