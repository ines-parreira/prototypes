import { renderHook } from '@testing-library/react-hooks'

import useShortcuts from 'hooks/useShortcuts'

import { useNavBar } from '../useNavBar/useNavBar'
import { useNavBarShortcuts } from '../useNavBarShortcuts'

jest.mock('hooks/useShortcuts', () => jest.fn())
jest.mock('../useNavBar/useNavBar', () => ({
    NavBarDisplayMode: {
        Open: 'open',
        Collapsed: 'collapsed',
    },
    useNavBar: jest.fn(),
}))

const useShortcutsMock = useShortcuts as jest.Mock
const useNavBarMock = useNavBar as jest.Mock

describe('useNavBarShortcuts', () => {
    let onNavBarShortCutToggle: jest.Mock

    beforeEach(() => {
        onNavBarShortCutToggle = jest.fn()
        useNavBarMock.mockReturnValue({ onNavBarShortCutToggle })
    })

    it('should register navbar shortcuts', () => {
        renderHook(() => useNavBarShortcuts())

        expect(useShortcuts).toHaveBeenCalledWith('App', {
            TOGGLE_NAVBAR: {
                action: expect.any(Function),
            },
        })
    })

    it('should toggle the navbar', () => {
        renderHook(() => useNavBarShortcuts())

        const { action: toggleNavBar } = (
            useShortcutsMock.mock.calls as [
                [string, { TOGGLE_NAVBAR: { action: () => void } }],
            ]
        )[0][1].TOGGLE_NAVBAR

        toggleNavBar()
        expect(onNavBarShortCutToggle).toHaveBeenCalled()
    })
})
