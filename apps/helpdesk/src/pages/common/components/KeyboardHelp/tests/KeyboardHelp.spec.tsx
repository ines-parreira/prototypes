import { assumeMock } from '@repo/testing'
import { useHelpdeskV2MS1Flag } from '@repo/tickets/feature-flags'
import { shortcuts } from '@repo/utils'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { makeExecuteKeyboardAction } from 'utils/testing'

import KeyboardHelp from '../KeyboardHelp'

jest.mock('@repo/tickets/feature-flags')
const useHelpdeskV2MS1FlagMock = assumeMock(useHelpdeskV2MS1Flag)

const badgeContentMock = 'badgeContentMock'

jest.mock('@repo/utils', () => {
    const React = jest.requireActual('react')
    const actual = jest.requireActual('@repo/utils')
    const mockBind = jest.fn()
    const mockUnbind = jest.fn()
    const mockGetActionKeys = jest.fn((action) => {
        const key =
            typeof action.key === 'string' ? action.key : action.key.join(',')
        return `${key}${badgeContentMock}`
    })
    const mockPause = jest.fn()
    const mockUnpause = jest.fn()

    return {
        ...actual,
        shortcutManager: {
            bind: mockBind,
            unbind: mockUnbind,
            getActionKeys: mockGetActionKeys,
            pause: mockPause,
            unpause: mockUnpause,
        },
        useShortcuts: (component: string, actions: Record<string, any>) => {
            React.useEffect(() => {
                mockBind(component, actions)
                return () => {
                    mockUnbind(component)
                }
            }, [actions, component])
        },
    }
})

// Get the mocked shortcutManager from the module
const { shortcutManager: shortcutManagerMock } = jest.requireMock('@repo/utils')

const shortcutEventMock = {
    preventDefault: jest.fn(),
} as unknown as jest.Mocked<Event>

describe('<KeyboardHelp />', () => {
    it('renders keyboard help modal', async () => {
        render(<KeyboardHelp />)

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'KeyboardHelp',
        )('SHOW_HELP')

        expect(screen.getByText(/Keyboard shortcuts/)).toBeInTheDocument()
        expect(
            screen.getByText(shortcuts['App'].description!),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                `${
                    shortcuts['App'].actions.GO_HOME.key as string
                }${badgeContentMock}`,
            ),
        ).toBeInTheDocument()

        fireEvent.keyDown(document.body, { key: 'Escape' })

        await waitFor(() =>
            expect(
                screen.queryByText(/Keyboard shortcuts/),
            ).not.toBeInTheDocument(),
        )
    })

    it('should render Infobar shortcuts when UIVisionMilestone1 flag is true', () => {
        useHelpdeskV2MS1FlagMock.mockReturnValue(true)

        render(<KeyboardHelp />)

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'KeyboardHelp',
        )('SHOW_HELP')

        expect(screen.getByText('Infobar')).toBeInTheDocument()
    })

    it('should not render Infobar shortcuts when UIVisionMilestone1 flag is false', () => {
        useHelpdeskV2MS1FlagMock.mockReturnValue(false)

        render(<KeyboardHelp />)

        makeExecuteKeyboardAction(
            shortcutManagerMock,
            shortcutEventMock,
            'KeyboardHelp',
        )('SHOW_HELP')

        expect(screen.queryByText('Infobar')).not.toBeInTheDocument()
    })
})
