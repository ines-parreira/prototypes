import type { ReactNode } from 'react'
import React from 'react'

import { useHelpdeskV2MS4Dash6Flag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import { shortcutManager } from '@repo/utils'
import { fireEvent, screen } from '@testing-library/react'

import { useAppSelector } from 'hooks/useAppSelector'
import { Spotlight } from 'pages/common/components/Spotlight/Spotlight'
import type { SpotlightContextType } from 'providers/ui/SpotlightContext'
import { SpotlightContext } from 'providers/ui/SpotlightContext'

jest.mock('pages/common/components/Spotlight/SpotlightModal.tsx', () => ({
    __esModule: true,
    SpotlightModal: ({ onCloseModal }: { onCloseModal: () => void }) => (
        <div>
            <button name="close" onClick={onCloseModal}>
                Legacy close
            </button>
        </div>
    ),
}))

jest.mock('@repo/search', () => ({
    SearchSpotlightRoot: ({ onClose }: { onClose: () => void }) => (
        <div>
            <button name="close-new" onClick={onClose}>
                New close
            </button>
        </div>
    ),
}))

jest.mock('hooks/useAppSelector', () => ({
    useAppSelector: jest.fn(() => true),
}))

jest.mock('@repo/feature-flags', () => ({
    useHelpdeskV2MS4Dash6Flag: jest.fn(() => false),
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
const mockUseAppSelector = assumeMock(useAppSelector)
const mockUseHelpdeskV2MS4Dash6Flag = assumeMock(useHelpdeskV2MS4Dash6Flag)

jest.mock('@repo/logging')
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
    beforeEach(() => {
        mockUseAppSelector.mockReturnValue(true)
        mockUseHelpdeskV2MS4Dash6Flag.mockReturnValue(false)
    })

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

    it('should close the new spotlight modal when the flag is enabled', () => {
        const setIsOpen = jest.fn()
        const providerProps = {
            isOpen: true,
            setIsOpen,
        }

        mockUseHelpdeskV2MS4Dash6Flag.mockReturnValue(true)

        renderWithSpotlightContext(<Spotlight />, { providerProps })

        fireEvent.click(screen.getByRole('button', { name: /new close/i }))

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

    it('renders the legacy spotlight modal when the flag is disabled', () => {
        renderWithSpotlightContext(<Spotlight />, {
            providerProps: {
                isOpen: true,
                setIsOpen: jest.fn(),
            },
        })

        expect(
            screen.getByRole('button', { name: /legacy close/i }),
        ).toBeInTheDocument()
    })

    it('renders the new spotlight root when the flag is enabled', () => {
        mockUseHelpdeskV2MS4Dash6Flag.mockReturnValue(true)

        renderWithSpotlightContext(<Spotlight />, {
            providerProps: {
                isOpen: true,
                setIsOpen: jest.fn(),
            },
        })

        expect(
            screen.getByRole('button', { name: /new close/i }),
        ).toBeInTheDocument()
    })
})
