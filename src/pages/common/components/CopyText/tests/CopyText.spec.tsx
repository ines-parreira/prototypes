import React from 'react'

import {fireEvent, render} from '@testing-library/react'

import CopyText from '../CopyText'
import {selectText} from '../utils'

jest.mock('../utils', () => ({
    selectText: jest.fn(),
}))

const mockedCopyToClipboard = jest.fn()
jest.mock('react-use', () => {
    const module: Record<string, unknown> = jest.requireActual('react-use')

    return {...module, useCopyToClipboard: () => [null, mockedCopyToClipboard]}
})

describe('<Copytext />', () => {
    it('copies and selects text to clipboard', () => {
        render(<CopyText text="test text" />)

        const copyButton = document.querySelector('button')
        copyButton && fireEvent.click(copyButton)

        expect(selectText).toHaveBeenCalledWith('copy-text1')
        expect(mockedCopyToClipboard).toHaveBeenCalledWith('test text')
    })
})
