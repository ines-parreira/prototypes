import React from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { render, within } from '@testing-library/react'

import {
    THEME_CONFIGS,
    THEME_NAME,
    themeTokenMap,
    useSetTheme,
    useTheme,
} from 'core/theme'

import ThemeMenu from '../ThemeMenu'

jest.mock(
    '@repo/logging',
    () =>
        ({
            ...jest.requireActual('@repo/logging'),
            logEvent: jest.fn(),
        }) as typeof import('@repo/logging'),
)

jest.mock(
    'core/theme',
    () =>
        ({
            ...jest.requireActual('core/theme'),
            useSetTheme: jest.fn(),
            useTheme: jest.fn(),
        }) as typeof import('core/theme'),
)
const useSetThemeMock = assumeMock(useSetTheme)
const useThemeMock = assumeMock(useTheme)
const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

describe('ThemeMenu', () => {
    let setTheme: jest.Mock

    beforeEach(() => {
        setTheme = jest.fn()
        useSetThemeMock.mockReturnValue(setTheme)
        useThemeMock.mockReturnValue({
            name: THEME_NAME.Classic,
            resolvedName: THEME_NAME.Classic,
            tokens: themeTokenMap[THEME_NAME.Classic],
        })
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
    })

    it.each(THEME_CONFIGS.map(({ label, name }) => [name, label]))(
        'should render the %s theme',
        (_, label) => {
            const { getByText } = render(<ThemeMenu />)
            expect(getByText(label)).toBeInTheDocument()
        },
    )

    it('should mark the active theme', () => {
        const { getByText } = render(<ThemeMenu />)
        const el = getByText('Classic')
        expect(within(el).getByText('done')).toBeInTheDocument()
    })

    it('should set the active theme and log an event', () => {
        const { getByText } = render(<ThemeMenu />)
        userEvent.click(getByText('Dark'))
        expect(setTheme).toHaveBeenCalledWith(THEME_NAME.Dark)
        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.ThemeUpdate, {
            theme: THEME_NAME.Dark,
        })
    })

    describe('when the wayfinding MS1 flag is enabled', () => {
        beforeEach(() => {
            useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)
        })

        it('should not render the classic theme option', () => {
            const { queryByText } = render(<ThemeMenu />)
            expect(queryByText('Classic')).not.toBeInTheDocument()
        })

        it.each(
            THEME_CONFIGS.filter(({ name }) => name !== THEME_NAME.Classic).map(
                ({ label, name }) => [name, label],
            ),
        )('should still render the %s theme', (_, label) => {
            const { getByText } = render(<ThemeMenu />)
            expect(getByText(label)).toBeInTheDocument()
        })
    })
})
