import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, {ComponentProps} from 'react'

import {useFlag} from 'common/flags'
import {macros} from 'fixtures/macro'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import {OrderDirection} from 'models/api/types'
import {MacroSortableProperties} from 'models/macro/types'

import {MacrosSettingsTable} from '../MacrosSettingsTable'

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

jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

describe('<MacrosSettingsTable />', () => {
    beforeEach(() => {
        useHasAgentPrivilegesMock.mockReturnValue(true)
        mockUseFlag.mockReturnValue(false)
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
        const {rerender} = render(
            <MacrosSettingsTable {...minProps} isLoading={true} />
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
        ({label, property}) => {
            render(<MacrosSettingsTable {...minProps} />)

            userEvent.click(screen.getByText(label))

            expect(minProps.onSortOptionsChange).toHaveBeenNthCalledWith(
                1,
                property,
                OrderDirection.Asc
            )
        }
    )

    it('should invert sorting to desc order when clicking on the current sorted property', () => {
        render(
            <MacrosSettingsTable
                {...minProps}
                options={{
                    order_by: `${MacroSortableProperties.Name}:${OrderDirection.Asc}`,
                }}
            />
        )

        userEvent.click(screen.getByText('Macro'))
        userEvent.click(screen.getByText('Macro'))

        expect(minProps.onSortOptionsChange).toHaveBeenCalledWith(
            MacroSortableProperties.Name,
            OrderDirection.Desc
        )
    })

    it('should invert sorting to asc order', () => {
        render(
            <MacrosSettingsTable
                {...minProps}
                options={{
                    order_by: `${MacroSortableProperties.Name}:${OrderDirection.Desc}`,
                }}
            />
        )

        userEvent.click(screen.getByText('Macro'))
        userEvent.click(screen.getByText('Macro'))

        expect(minProps.onSortOptionsChange).toHaveBeenCalledWith(
            MacroSortableProperties.Name,
            OrderDirection.Asc
        )
    })

    it('should sort by descending order first for Usage and Updated Datetime properties', () => {
        render(<MacrosSettingsTable {...minProps} />)

        userEvent.click(screen.getByText('Usage count'))
        expect(minProps.onSortOptionsChange).toHaveBeenLastCalledWith(
            MacroSortableProperties.Usage,
            OrderDirection.Desc
        )
        userEvent.click(screen.getByText('Last updated'))
        expect(minProps.onSortOptionsChange).toHaveBeenLastCalledWith(
            MacroSortableProperties.UpdatedDatetime,
            OrderDirection.Desc
        )
    })

    it('should display new UI for archivable macros', () => {
        mockUseFlag.mockReturnValue(true)
        render(<MacrosSettingsTable {...minProps} />)

        expect(screen.getByText('Archive')).toBeInTheDocument()
    })

    it('should disable bulk archive button when loading', () => {
        mockUseFlag.mockReturnValue(true)
        render(<MacrosSettingsTable {...minProps} isLoading />)

        expect(screen.getByLabelText('Archive')).toBeAriaDisabled()
    })

    it('should set checked state for the top checkbox properly', () => {
        const macroIds = [1, 2]

        mockUseFlag.mockReturnValue(true)
        const {rerender} = render(
            <MacrosSettingsTable
                {...minProps}
                macros={macrosFixtures}
                selectedMacrosIds={[]}
            />
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
            />
        )
        expect(checkboxAll).toHaveProperty('indeterminate', true)

        firstMacro.click()

        expect(minProps.setSelectedMacrosIds).toHaveBeenCalledWith([])

        rerender(
            <MacrosSettingsTable
                {...minProps}
                macros={macrosFixtures}
                selectedMacrosIds={[]}
            />
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
            />
        )
        expect(checkboxAll).toBeChecked()

        checkboxAll.click()

        expect(minProps.setSelectedMacrosIds).toHaveBeenCalledWith([])
    })
})
