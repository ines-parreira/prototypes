import type { ComponentProps } from 'react'
import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock, userEvent } from '@repo/testing'
import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { useLocation, useRouteMatch } from 'react-router-dom'

import { macros } from 'fixtures/macro'
import { useBulkArchiveMacros, useBulkUnarchiveMacros } from 'hooks/macros'
import useAppDispatch from 'hooks/useAppDispatch'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import { OrderDirection } from 'models/api/types'
import { MacroSortableProperties } from 'models/macro/types'

import { MacrosSettingsTable } from '../MacrosSettingsTable'

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
jest.mock('hooks/useHasAgentPrivileges')
jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')
jest.mock('pages/settings/macros/MoreActions', () => () => 'MoreActionsMock')

const useHasAgentPrivilegesMock = useHasAgentPrivileges as jest.MockedFunction<
    typeof useHasAgentPrivileges
>

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useRouteMatch: jest.fn(),
            useLocation: jest.fn(),
            Link: jest.fn(
                ({ children }: { children: React.ReactNode }) => children,
            ),
            NavLink: ({ children }: { children: React.ReactNode }) => children,
        }) as Record<string, unknown>,
)
const mockUseRouteMatch = useRouteMatch as jest.Mock
const mockUseLocation = useLocation as jest.Mock

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

jest.mock('hooks/macros')
const useBulkArchiveMacrosMock = assumeMock(useBulkArchiveMacros)
const useBulkUnarchiveMacrosMock = assumeMock(useBulkUnarchiveMacros)
const mockMutateBulkArchive = jest.fn()
const mockMutateBulkUnarchive = jest.fn()

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('state/notifications/actions')

describe('<MacrosSettingsTable />', () => {
    const invalidateQueriesMock = jest.fn()
    const dispatchMock = jest.fn()

    beforeEach(() => {
        mockMutateBulkArchive.mockResolvedValue(null)
        mockMutateBulkUnarchive.mockResolvedValue(null)
        useHasAgentPrivilegesMock.mockReturnValue(true)
        mockUseFlag.mockReturnValue(false)
        mockUseRouteMatch.mockReturnValue(false)
        mockUseLocation.mockReturnValue({
            pathname: '/app/settings/macros',
            search: '',
            hash: '',
            state: null,
        })
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useBulkArchiveMacrosMock.mockReturnValue({
            mutate: mockMutateBulkArchive,
        } as unknown as ReturnType<typeof useBulkArchiveMacros>)
        useBulkUnarchiveMacrosMock.mockReturnValue({
            mutate: mockMutateBulkUnarchive,
        } as unknown as ReturnType<typeof useBulkUnarchiveMacros>)
        useQueryClientMock.mockImplementation(
            () =>
                ({
                    invalidateQueries: invalidateQueriesMock,
                }) as unknown as QueryClient,
        )
    })

    const macrosFixtures = [macros[0], macros[1]]

    const minProps = {
        isLoading: false,
        macros: [],
        onMacroDelete: jest.fn(),
        onMacroDuplicate: jest.fn(),
        onSortOptionsChange: jest.fn(),
        options: {
            orderBy:
                `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}` as const,
        },
        selectedMacrosIds: [],
        setSelectedMacrosIds: jest.fn(),
    } as unknown as ComponentProps<typeof MacrosSettingsTable>

    it('should display a loading when fetching macros', () => {
        const { rerender } = render(
            <MacrosSettingsTable {...minProps} isLoading={true} />,
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()

        rerender(<MacrosSettingsTable {...minProps} isLoading={false} />)

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    it('should display a list of macros', () => {
        render(<MacrosSettingsTable {...minProps} macros={macrosFixtures} />)

        expect(screen.getByText('Macro')).toBeInTheDocument()
        expect(screen.getByText('Tags')).toBeInTheDocument()
        expect(screen.getByText('Language')).toBeInTheDocument()
        expect(screen.getByText('Usage count')).toBeInTheDocument()
        expect(screen.getByText(macrosFixtures[0].name!)).toBeInTheDocument()
        expect(screen.getByText(macrosFixtures[1].name!)).toBeInTheDocument()
    })

    it.each([
        {
            label: 'Macro',
            property: MacroSortableProperties.Name,
        },
        {
            label: 'Language',
            property: MacroSortableProperties.Language,
        },
    ])(
        'should change sort column when clicking header cell',
        ({ label, property }) => {
            render(<MacrosSettingsTable {...minProps} />)

            userEvent.click(screen.getByText(label))

            expect(minProps.onSortOptionsChange).toHaveBeenNthCalledWith(
                1,
                property,
                OrderDirection.Asc,
            )
        },
    )

    it('should invert sorting to desc order when clicking on the current sorted property', () => {
        render(
            <MacrosSettingsTable
                {...minProps}
                options={{
                    order_by: `${MacroSortableProperties.Name}:${OrderDirection.Asc}`,
                }}
            />,
        )

        userEvent.click(screen.getByText('Macro'))
        userEvent.click(screen.getByText('Macro'))

        expect(minProps.onSortOptionsChange).toHaveBeenCalledWith(
            MacroSortableProperties.Name,
            OrderDirection.Desc,
        )
    })

    it('should invert sorting to asc order', () => {
        render(
            <MacrosSettingsTable
                {...minProps}
                options={{
                    order_by: `${MacroSortableProperties.Name}:${OrderDirection.Desc}`,
                }}
            />,
        )

        userEvent.click(screen.getByText('Macro'))
        userEvent.click(screen.getByText('Macro'))

        expect(minProps.onSortOptionsChange).toHaveBeenCalledWith(
            MacroSortableProperties.Name,
            OrderDirection.Asc,
        )
    })

    it('should sort by descending order first for Usage and Updated Datetime properties', () => {
        render(<MacrosSettingsTable {...minProps} />)

        userEvent.click(screen.getByText('Usage count'))
        expect(minProps.onSortOptionsChange).toHaveBeenLastCalledWith(
            MacroSortableProperties.Usage,
            OrderDirection.Desc,
        )
        userEvent.click(screen.getByText('Last updated'))
        expect(minProps.onSortOptionsChange).toHaveBeenLastCalledWith(
            MacroSortableProperties.UpdatedDatetime,
            OrderDirection.Desc,
        )
    })

    it('should bulk archive macros', async () => {
        mockUseFlag.mockReturnValue(true)
        const selectedMacrosIds = [1, 2]
        render(
            <MacrosSettingsTable
                {...minProps}
                selectedMacrosIds={selectedMacrosIds}
                macros={macrosFixtures}
            />,
        )

        screen.getByText('Archive').click()

        expect(mockMutateBulkArchive).toHaveBeenCalledWith({
            data: { ids: selectedMacrosIds },
        })

        await waitFor(() =>
            expect(minProps.setSelectedMacrosIds).toHaveBeenCalledWith([]),
        )
    })

    it('should handle failure when bulk archiving macros', async () => {
        mockUseFlag.mockReturnValue(true)
        const selectedMacrosIds = [1, 2]
        render(
            <MacrosSettingsTable
                {...minProps}
                selectedMacrosIds={selectedMacrosIds}
                macros={macrosFixtures}
            />,
        )

        screen.getByText('Archive').click()

        expect(mockMutateBulkArchive).toHaveBeenCalledWith({
            data: { ids: selectedMacrosIds },
        })
        await waitFor(() =>
            expect(minProps.setSelectedMacrosIds).toHaveBeenCalledWith([]),
        )
    })

    it('should bulk unarchive macros', async () => {
        mockUseFlag.mockReturnValue(true)
        mockUseRouteMatch.mockReturnValue(true)
        const selectedMacrosIds = [1, 2]
        render(
            <MacrosSettingsTable
                {...minProps}
                selectedMacrosIds={selectedMacrosIds}
                macros={macrosFixtures}
            />,
        )

        screen.getByText('Unarchive').click()

        expect(mockMutateBulkUnarchive).toHaveBeenCalledWith({
            data: { ids: selectedMacrosIds },
        })
        await waitFor(() =>
            expect(minProps.setSelectedMacrosIds).toHaveBeenCalledWith([]),
        )
    })

    it('should disable bulk archive button when loading', () => {
        mockUseFlag.mockReturnValue(true)
        render(<MacrosSettingsTable {...minProps} isLoading />)

        expect(screen.getByLabelText('Archive')).toBeAriaDisabled()
    })

    it('should set checked state for the top checkbox properly', () => {
        const macroIds = [1, 2]

        mockUseFlag.mockReturnValue(true)
        const { rerender } = render(
            <MacrosSettingsTable
                {...minProps}
                macros={macrosFixtures}
                selectedMacrosIds={[]}
            />,
        )

        const checkboxAll = screen.getByLabelText('Select all')
        const firstMacro = screen.getByLabelText(macroIds[0])

        expect(checkboxAll).not.toBeChecked()

        firstMacro.click()

        expect(minProps.setSelectedMacrosIds).toHaveBeenCalledWith([1])

        rerender(
            <MacrosSettingsTable
                {...minProps}
                macros={macrosFixtures}
                selectedMacrosIds={[1]}
            />,
        )
        expect(checkboxAll).toHaveProperty('indeterminate', true)

        firstMacro.click()

        expect(minProps.setSelectedMacrosIds).toHaveBeenCalledWith([])

        rerender(
            <MacrosSettingsTable
                {...minProps}
                macros={macrosFixtures}
                selectedMacrosIds={[]}
            />,
        )
        expect(checkboxAll).toHaveProperty('indeterminate', false)
        expect(checkboxAll).not.toBeChecked()

        checkboxAll.click()

        expect(minProps.setSelectedMacrosIds).toHaveBeenCalledWith(macroIds)

        rerender(
            <MacrosSettingsTable
                {...minProps}
                macros={macrosFixtures}
                selectedMacrosIds={macroIds}
            />,
        )
        expect(checkboxAll).toBeChecked()

        checkboxAll.click()

        expect(minProps.setSelectedMacrosIds).toHaveBeenCalledWith([])
    })
})
