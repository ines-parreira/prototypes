import React, { ReactNode } from 'react'

import { assumeMock } from '@repo/testing'
import { shortcutManager } from '@repo/utils'
import { fireEvent, render, screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import Spotlight from 'pages/common/components/Spotlight/Spotlight'
import {
    SpotlightContext,
    SpotlightContextType,
} from 'providers/ui/SpotlightContext'

jest.mock('pages/common/components/Spotlight/SpotlightModal.tsx', () => ({
    __esModule: true,
    default: ({ onCloseModal }: { onCloseModal: () => void }) => (
        <div data-testid="spotlight-modal">
            <button name="close" onClick={onCloseModal}>
                Close
            </button>
        </div>
    ),
}))

jest.mock('@repo/utils', () => ({
    ...jest.requireActual('@repo/utils'),
    shortcutManager: {
        bind: jest.fn(),
        unbind: jest.fn(),
    },
}))
const mockShortcutManager = shortcutManager as jest.Mocked<
    typeof shortcutManager
>

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

const renderWithSpotlightContext = (
    ui: ReactNode,
    { providerProps }: { providerProps: SpotlightContextType },
) => {
    return render(
        <SpotlightContext.Provider value={providerProps}>
            {ui}
        </SpotlightContext.Provider>,
    )
}

describe('Spotlight', () => {
    it('should open the spotlight modal when the toggle shortcut is activated', () => {
        const setIsOpen = jest.fn()
        const providerProps = {
            isOpen: false,
            setIsOpen,
        }

        renderWithSpotlightContext(<Spotlight />, { providerProps })

        // Simulate the shortcut action
        const toggleAction =
            mockShortcutManager.bind.mock.calls[0][1]?.TOGGLE_SPOTLIGHT.action
        const mockEvent = new KeyboardEvent('someEvent')
        toggleAction && toggleAction(mockEvent)

        expect(setIsOpen).toHaveBeenCalledWith(true)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchOpenShortcut,
        )
    })

    it('should close the spotlight modal when onCloseModal is called', () => {
        const setIsOpen = jest.fn()
        const providerProps = {
            isOpen: true,
            setIsOpen,
        }

        renderWithSpotlightContext(<Spotlight />, { providerProps })

        fireEvent.click(screen.getByRole('button', { name: /close/i }))

        expect(setIsOpen).toHaveBeenCalledWith(false)
    })

    it('should render even if the Feature Flag is not loaded', () => {
        const setIsOpen = jest.fn()
        const providerProps = {
            isOpen: false,
            setIsOpen,
        }

        const { container } = renderWithSpotlightContext(<Spotlight />, {
            providerProps,
        })

        expect(container).not.toBeEmptyDOMElement()
    })
})
