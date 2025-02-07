import {
    useBulkArchiveMacros,
    useBulkUnarchiveMacros,
} from '@gorgias/api-queries'
import {QueryClient, useQueryClient} from '@tanstack/react-query'
import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {useRouteMatch} from 'react-router-dom'

import {macros} from 'fixtures/macro'
import useAppDispatch from 'hooks/useAppDispatch'
import {OrderDirection} from 'models/api/types'
import {MacroSortableProperties} from 'models/macro/types'
import {assumeMock} from 'utils/testing'

import {MacrosSettingsItem} from '../MacrosSettingsItem'

jest.mock('@gorgias/merchant-ui-kit', () => {
    return {
        ...jest.requireActual('@gorgias/merchant-ui-kit'),
        Tooltip: () => <div>Tooltip</div>,
    } as Record<string, unknown>
})
jest.mock('pages/history')

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
                ({children}: {children: React.ReactNode}) => children
            ),
            NavLink: ({children}: {children: React.ReactNode}) => children,
        }) as Record<string, unknown>
)

const mockUseRouteMatch = useRouteMatch as jest.Mock
jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)

jest.mock('@tanstack/react-query')
const useQueryClientMock = assumeMock(useQueryClient)

jest.mock('@gorgias/api-queries', () => ({
    __esModule: true,
    useBulkArchiveMacros: jest.fn(),
    useBulkUnarchiveMacros: jest.fn(),
    queryKeys: {
        macros: {
            listMacros: () => ({pop: () => null}),
        },
    },
}))
const useBulkArchiveMacrosMock = assumeMock(useBulkArchiveMacros)
const useBulkUnarchiveMacrosMock = assumeMock(useBulkUnarchiveMacros)
const mockMutateAsyncBulkArchive = jest.fn()
const mockMutateAsyncBulkUnarchive = jest.fn()

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
                }) as unknown as QueryClient
        )
        useAppDispatchMock.mockReturnValue(dispatchMock)
        useBulkArchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateAsyncBulkArchive,
        } as unknown as ReturnType<typeof useBulkArchiveMacros>)
        useBulkUnarchiveMacrosMock.mockReturnValue({
            mutateAsync: mockMutateAsyncBulkUnarchive,
        } as unknown as ReturnType<typeof useBulkUnarchiveMacros>)
    })

    it('should display a macro row', () => {
        render(<MacrosSettingsItem {...minProps} />)

        expect(screen.getByText(minProps.macro.name!)).toBeInTheDocument()
    })

    it('should duplicate a macro', () => {
        render(<MacrosSettingsItem {...minProps} />)

        userEvent.click(screen.getByTitle('Duplicate macro'))

        expect(minProps.onMacroDuplicate).toHaveBeenCalledWith(minProps.macro)
    })

    it('should delete macro', () => {
        render(<MacrosSettingsItem {...minProps} />)

        act(() => {
            userEvent.click(screen.getByTitle('Delete macro'))
        })
        act(() => {
            userEvent.click(screen.getByText('Confirm', {exact: false}))
        })

        expect(minProps.onMacroDelete).toHaveBeenCalledWith(1)
    })

    it('should display new UI for archivable macros', () => {
        render(<MacrosSettingsItem {...minProps} isArchivingAvailable />)

        expect(screen.getByText('archive')).toBeInTheDocument()
    })

    it('should display new UI for active macros', () => {
        mockUseRouteMatch.mockReturnValue(true)
        render(<MacrosSettingsItem {...minProps} isArchivingAvailable />)

        expect(screen.getByText('unarchive')).toBeInTheDocument()
    })
})
