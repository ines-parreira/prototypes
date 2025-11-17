import type React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { useRouteMatch } from 'react-router-dom'

import type { Macro } from '@gorgias/helpdesk-queries'

import { macros as macrosFixtures } from 'fixtures/macro'
import { useBulkArchiveMacros, useBulkUnarchiveMacros } from 'hooks/macros'
import type { MacrosState } from 'state/entities/macros/types'

import MoreActions from '../MoreActions'

jest.mock('hooks/macros')
const useBulkArchiveMacrosMock = assumeMock(useBulkArchiveMacros)
const useBulkUnarchiveMacrosMock = assumeMock(useBulkUnarchiveMacros)

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
const mockMutateBulkArchive = jest.fn()
const mockMutateBulkUnarchive = jest.fn()

jest.mock('state/notifications/actions')

describe('<MoreActions />', () => {
    beforeEach(() => {
        mockUseRouteMatch.mockReturnValue(false)
        useBulkArchiveMacrosMock.mockReturnValue({
            mutate: mockMutateBulkArchive,
        } as unknown as ReturnType<typeof useBulkArchiveMacros>)
        useBulkUnarchiveMacrosMock.mockReturnValue({
            mutate: mockMutateBulkUnarchive,
        } as unknown as ReturnType<typeof useBulkUnarchiveMacros>)
    })

    const macrosState: MacrosState = macrosFixtures.reduce(
        (acc: MacrosState, macro: Macro) => ({
            ...acc,
            [macro.id!]: macro,
        }),
        {},
    )

    const props = {
        hasAgentPrivileges: false,
        macro: macrosFixtures[0],
        macros: macrosState,
        onMacroDelete: jest.fn(),
        onMacroDuplicate: jest.fn(),
        onMacroArchiveOrUnarchived: jest.fn(),
    }

    it('should display disabled action buttons', () => {
        render(<MoreActions {...props} />)

        expect(screen.getByLabelText('Archive macro')).toBeAriaDisabled()
        expect(
            screen.getByLabelText('More actions on macro'),
        ).toBeAriaDisabled()
    })

    it('should archive macro', () => {
        render(<MoreActions {...props} hasAgentPrivileges />)

        screen.getByLabelText('Archive macro').click()

        expect(screen.getByLabelText('Archive macro')).toBeAriaEnabled()
        expect(mockMutateBulkArchive).toHaveBeenCalledWith(
            {
                data: { ids: [props.macro.id] },
            },
            { onSettled: expect.any(Function) },
        )
        ;(
            mockMutateBulkArchive.mock.calls[0] as {
                onSettled: (arg: unknown) => void
            }[]
        )[1].onSettled({
            data: {
                data: {
                    data: [{ id: 1, status: 'archived' }],
                },
            },
        })

        expect(props.onMacroArchiveOrUnarchived).toHaveBeenCalledWith(1)
    })

    it('should handle errors when archive macro attempt failed', () => {
        render(<MoreActions {...props} hasAgentPrivileges />)

        screen.getByLabelText('Archive macro').click()

        expect(screen.getByLabelText('Archive macro')).toBeAriaEnabled()
        expect(mockMutateBulkArchive).toHaveBeenCalledWith(
            {
                data: { ids: [props.macro.id] },
            },
            { onSettled: expect.any(Function) },
        )
        const msg = 'error title'
        ;(
            mockMutateBulkArchive.mock.calls[0] as {
                onSettled: (arg: unknown) => void
            }[]
        )[1].onSettled({
            data: {
                data: {
                    data: [
                        {
                            id: 1,
                            status: 'macro_used',
                            error: {
                                msg,
                                data: { rules: ['rule using the macro'] },
                            },
                        },
                    ],
                },
            },
        })
        expect(props.onMacroArchiveOrUnarchived).not.toHaveBeenCalled()
    })

    it('should unarchive macro', () => {
        mockUseRouteMatch.mockReturnValue(true)
        render(<MoreActions {...props} hasAgentPrivileges />)

        screen.getByLabelText('Unarchive macro').click()

        expect(mockMutateBulkUnarchive).toHaveBeenCalledWith(
            {
                data: { ids: [props.macro.id] },
            },
            {
                onSettled: expect.any(Function),
            },
        )
        const mockCalls = (
            mockMutateBulkUnarchive.mock.calls[0] as {
                onSettled: () => void
            }[]
        )[1]

        mockCalls.onSettled()

        expect(props.onMacroArchiveOrUnarchived).toHaveBeenCalledWith(1)
    })

    it('should duplicate macro', async () => {
        render(<MoreActions {...props} hasAgentPrivileges />)

        screen.getByLabelText('More actions on macro').click()

        await screen.findByText(/Make a copy/)
        screen.getByText(/Make a copy/).click()

        expect(props.onMacroDuplicate).toHaveBeenCalled()
    })

    it('should delete macro', async () => {
        render(<MoreActions {...props} hasAgentPrivileges />)

        screen.getByLabelText('More actions on macro').click()

        await screen.findByText(/Delete/)
        screen.getByText(/Delete/).click()

        await screen.findByText(/You are about to delete/)
        expect(screen.getByText(/You are about to delete/)).toBeInTheDocument()

        screen.getByText(/Confirm/).click()

        expect(props.onMacroDelete).toHaveBeenCalled()
        expect(props.onMacroDelete).toHaveBeenCalled()
    })
})
