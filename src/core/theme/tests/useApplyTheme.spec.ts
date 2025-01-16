import {THEME_NAME} from '@gorgias/design-tokens'
import {renderHook} from '@testing-library/react-hooks'

import {assumeMock} from 'utils/testing'

import type {Theme} from '../types'
import useApplyTheme from '../useApplyTheme'
import useTheme from '../useTheme'

jest.mock('../useTheme', () => jest.fn())
const useThemeMock = assumeMock(useTheme)

describe('useApplyTheme', () => {
    it('should add the theme class to the body', () => {
        useThemeMock.mockReturnValue({
            resolvedName: THEME_NAME.Classic,
        } as Theme)

        renderHook(() => useApplyTheme())

        expect(document.body.classList.contains(THEME_NAME.Classic)).toBe(true)
    })

    it('should remove all other theme classes from the body', () => {
        document.body.classList.add(THEME_NAME.Dark)
        document.body.classList.add(THEME_NAME.Light)
        useThemeMock.mockReturnValue({
            resolvedName: THEME_NAME.Classic,
        } as Theme)

        renderHook(() => useApplyTheme())

        expect(document.body.classList.contains(THEME_NAME.Classic)).toBe(true)
        expect(document.body.classList.contains(THEME_NAME.Dark)).toBe(false)
        expect(document.body.classList.contains(THEME_NAME.Light)).toBe(false)
    })
})
