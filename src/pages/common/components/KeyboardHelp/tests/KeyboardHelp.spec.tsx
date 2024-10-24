import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'

import keymap from 'config/shortcuts'
import shortcutManager from 'services/shortcutManager'
import {makeExecuteKeyboardAction} from 'utils/testing'

import KeyboardHelp from '../KeyboardHelp'

jest.mock('services/shortcutManager')
const shortcutManagerMock = shortcutManager as jest.Mocked<
    typeof shortcutManager
>
const badgeContentMock = 'badgeContentMock'
shortcutManagerMock.getActionKeys.mockImplementation((action) => {
    const key =
        typeof action.key === 'string' ? action.key : action.key.join(',')
    return `${key}${badgeContentMock}`
})

const shortcutEventMock = {
    preventDefault: jest.fn(),
} as unknown as jest.Mocked<Event>

describe('<KeyboardHelp />', () => {
    it('renders keyboard help modal', async () => {
        render(<KeyboardHelp />)

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'KeyboardHelp'
        )('SHOW_HELP')

        expect(screen.getByText(/Keyboard shortcuts/)).toBeInTheDocument()
        expect(screen.getByText(keymap['App'].description!)).toBeInTheDocument()
        expect(
            screen.getByText(
                `${
                    keymap['App'].actions.GO_HOME.key as string
                }${badgeContentMock}`
            )
        ).toBeInTheDocument()

        fireEvent.keyDown(document.body, {key: 'Escape'})

        await waitFor(() =>
            expect(
                screen.queryByText(/Keyboard shortcuts/)
            ).not.toBeInTheDocument()
        )
    })
})
