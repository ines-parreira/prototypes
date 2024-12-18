import {ListMacrosOrderBy} from '@gorgias/api-queries'
import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {macros as macrosFixtures} from 'fixtures/macro'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import {OrderDirection} from 'models/api/types'
import {MacroSortableProperties} from 'models/macro/types'

import {MacrosSettingsTable} from '../MacrosSettingsTable'

jest.mock('models/macro/resources')
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
jest.mock('hooks/useHasAgentPrivileges')
jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')

const useHasAgentPrivilegesMock = useHasAgentPrivileges as jest.MockedFunction<
    typeof useHasAgentPrivileges
>

describe('<MacrosSettingsTable/>', () => {
    useHasAgentPrivilegesMock.mockReturnValue(true)

    const minProps = {
        isLoading: false,
        macros: [],
        onMacroDelete: jest.fn(),
        onMacroDuplicate: jest.fn(),
        onSortOptionsChange: jest.fn(),
        options: {
            order_by: ListMacrosOrderBy.CreatedDatetimeAsc,
        },
    }

    it('should display a loading when fetching macros', () => {
        const {rerender} = render(
            <MacrosSettingsTable {...minProps} isLoading={true} />
        )

        expect(document.getElementsByClassName('md-spin')).toHaveLength(1)

        rerender(<MacrosSettingsTable {...minProps} isLoading={false} />)

        expect(document.getElementsByClassName('md-spin')).toHaveLength(0)
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

    it('should duplicate a macro', () => {
        render(<MacrosSettingsTable {...minProps} macros={macrosFixtures} />)

        userEvent.click(screen.getAllByTitle('Duplicate macro')[0])

        expect(minProps.onMacroDuplicate).toHaveBeenCalledWith(
            macrosFixtures[0]
        )
    })

    it('should delete macro', () => {
        render(<MacrosSettingsTable {...minProps} macros={macrosFixtures} />)

        act(() => {
            userEvent.click(screen.getAllByTitle('Delete macro')[0])
        })
        act(() => {
            userEvent.click(screen.getByText('Confirm', {exact: false}))
        })

        expect(minProps.onMacroDelete).toHaveBeenCalledWith(1)
    })

    it('should change sort column when clicking header cell', () => {
        render(<MacrosSettingsTable {...minProps} />)

        userEvent.click(document.getElementsByTagName('th')[0])

        expect(minProps.onSortOptionsChange).toHaveBeenCalledWith(
            MacroSortableProperties.Name,
            OrderDirection.Asc
        )
    })
})
