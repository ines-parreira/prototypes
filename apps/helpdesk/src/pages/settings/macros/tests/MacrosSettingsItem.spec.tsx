import type React from 'react'

import { assumeMock } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouteMatch } from 'react-router-dom'

import { macros } from 'fixtures/macro'
import { useBulkArchiveMacros, useBulkUnarchiveMacros } from 'hooks/macros'
import useAppDispatch from 'hooks/useAppDispatch'
import { OrderDirection } from 'models/api/types'
import { MacroSortableProperties } from 'models/macro/types'

import { MacrosSettingsItem } from '../MacrosSettingsItem'

jest.mock('@gorgias/axiom', () => {
    return {
        ...jest.requireActual('@gorgias/axiom'),
        LegacyTooltip: () => <div>Tooltip</div>,
    } as Record<string, unknown>
})
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

jest.mock('reactstrap', () => {
    const reactstrap: Record<string, unknown> = jest.requireActual('reactstrap')

    return {
        ...reactstrap,
        Popover: (props: Record<string, any>) => {
            return props.isOpen ? <div {...props}>{props.children}</div> : null
        },
    }
})

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useRouteMatch: jest.fn(),
            Link: jest.fn(
                ({ children }: { children: React.ReactNode }) => children,
            ),
            NavLink: ({ children }: { children: React.ReactNode }) => children,
        }) as Record<string, unknown>,
)

const mockUseRouteMatch = useRouteMatch as jest.Mock
jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('hooks/macros')
const useBulkArchiveMacrosMock = assumeMock(useBulkArchiveMacros)
const useBulkUnarchiveMacrosMock = assumeMock(useBulkUnarchiveMacros)
const mockMutateBulkArchive = jest.fn()
const mockMutateBulkUnarchive = jest.fn()

describe('<MacrosSettingsItem />', () => {
    const invalidateQueriesMock = jest.fn()
    const dispatchMock = jest.fn()

    const minProps = {
        datetimeFormat: '"MM/DD/YYYY"',
        hasAgentPrivileges: true,
        isArchivingAvailable: false,
        macro: macros[0],
        onMacroDelete: jest.fn(),
        onMacroDuplicate: jest.fn(),
        onMacroArchiveOrUnarchived: jest.fn(),
        options: {
            order_by:
                `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}` as const,
        },
        selectedMacrosIds: [],
        setSelectedMacrosIds: jest.fn(),
    }

    beforeEach(() => {
        mockUseRouteMatch.mockReturnValue(false)
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useBulkArchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateBulkArchive,
        } as unknown as ReturnType<typeof useBulkArchiveMacros>)
        useBulkUnarchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateBulkUnarchive,
        } as unknown as ReturnType<typeof useBulkUnarchiveMacros>)
    })

    it('should display a macro row', () => {
        render(<MacrosSettingsItem {...minProps} />)

        expect(screen.getByText('archive')).toBeInTheDocument()
        expect(screen.getByText(minProps.macro.name!)).toBeInTheDocument()
    })

    it('should duplicate a macro', async () => {
        render(<MacrosSettingsItem {...minProps} />)

        await screen.findByText('more_vert')

        screen.getByText('more_vert').click()
        await screen.findByText(/Make a copy/)
        screen.getByText(/Make a copy/).click()

        await waitFor(() => {
            expect(minProps.onMacroDuplicate).toHaveBeenCalledWith(
                minProps.macro,
            )
        })
    })

    it('should delete macro', async () => {
        render(<MacrosSettingsItem {...minProps} />)

        await screen.findByText('more_vert')
        screen.getByText('more_vert').click()
        await screen.findByText(/Delete/)
        screen.getByText(/Delete/).click()
        await screen.findByText('Confirm', { exact: false })
        screen.getByText('Confirm', { exact: false }).click()

        await waitFor(() => {
            expect(minProps.onMacroDelete).toHaveBeenCalledWith(1)
        })
    })

    it('should display proper UI for active macros', () => {
        mockUseRouteMatch.mockReturnValue(true)
        render(<MacrosSettingsItem {...minProps} />)

        expect(screen.getByText('unarchive')).toBeInTheDocument()
    })
})
