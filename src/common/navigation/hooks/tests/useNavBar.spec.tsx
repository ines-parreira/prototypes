import {renderHook} from '@testing-library/react-hooks'
import React, {ReactNode} from 'react'

import {
    NavBarContext,
    NavBarContextType,
    NavBarDisplayMode,
} from '../useNavBar/context'
import {useNavBar} from '../useNavBar/useNavBar'

const mockNavBarContextValues: NavBarContextType = {
    navBarDisplay: NavBarDisplayMode.Open,
    setNavBarDisplay: jest.fn(),
    isNavBarVisible: false,
    isGlobalNavHovered: false,
    onGlobalNavHover: jest.fn(),
    onGlobalNavLeave: jest.fn(),
    onOverlayEnter: jest.fn(),
    onMenuToggle: jest.fn(),
}

const wrapper = ({children}: {children: ReactNode}) => (
    <NavBarContext.Provider value={mockNavBarContextValues}>
        {children}
    </NavBarContext.Provider>
)

describe('useNavBar', () => {
    it('should return context when used within NavBarProvider', () => {
        const {result} = renderHook(useNavBar, {wrapper})

        expect(result.current).toBe(mockNavBarContextValues)
    })

    it('should throw error when used outside NavBarProvider', () => {
        const {result} = renderHook(useNavBar)

        expect(result.error).toEqual(
            new Error('useNavBar must be used within a NavBarProvider')
        )
    })
})
