import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _noop from 'lodash/noop'
import {EmojiData} from 'emoji-mart'

import EmojiPicker from '../../../EmojiPicker/EmojiPicker'
import EmojiSelect from '../EmojiSelect'
import css from '../EmojiSelect.less'

const POPOVER_SELECTOR = '.popover'

jest.mock(
    '../../../EmojiPicker/EmojiPicker.tsx',
    () => ({onClick}: ComponentProps<typeof EmojiPicker>) => {
        return (
            <div data-testid="EmojiPicker">
                <div
                    data-testid="EmojiPicker-new-emoji"
                    onClick={() => {
                        onClick!({native: '1'} as EmojiData)
                    }}
                />
            </div>
        )
    }
)

const defaultProps = {
    emoji: '1',
    onEmojiSelect: _noop,
    onEmojiClear: _noop,
}

afterEach(() => {
    jest.clearAllMocks()
})

// Hide popover by clicking the trigger.
// Erasing the DOM freaks out Popper.js (used by Reactstrap)
afterEach(() => {
    const popover = global.document.querySelector(POPOVER_SELECTOR)
    if (popover) {
        ;(global.document.querySelector('.' + css.icon) as HTMLElement).click()
    }
})

describe('<EmojiSelect/>', () => {
    describe('.render()', () => {
        it('should show smiley when no emoji selected', () => {
            const {baseElement} = render(
                <EmojiSelect {...defaultProps} emoji={null} />
            )
            expect(baseElement).toMatchSnapshot()
        })

        it('show emoji picker on icon click', () => {
            const {baseElement, getByText} = render(
                <EmojiSelect {...defaultProps} />
            )
            userEvent.click(getByText('1'))
            expect(baseElement).toMatchSnapshot()
        })
    })

    describe('onEmojiSelect()', () => {
        it('should call onEmojiSelect on emoji click', () => {
            const onEmojiSelect = jest.spyOn(defaultProps, 'onEmojiSelect')
            const {getByTestId, getByText} = render(
                <EmojiSelect {...defaultProps} />
            )
            userEvent.click(getByText('1'))
            userEvent.click(getByTestId('EmojiPicker-new-emoji'))
            expect(onEmojiSelect).toHaveBeenCalled()
        })
    })

    describe('onEmojiClear()', () => {
        it('should call onEmojiClear on clear button click', () => {
            const onEmojiClear = jest.spyOn(defaultProps, 'onEmojiClear')
            const {getByText} = render(<EmojiSelect {...defaultProps} />)
            userEvent.click(getByText('1'))
            userEvent.click(
                global.document.querySelector(
                    '.' + css.clearButton
                ) as HTMLElement
            )
            expect(onEmojiClear).toHaveBeenLastCalledWith()
        })
    })
})
