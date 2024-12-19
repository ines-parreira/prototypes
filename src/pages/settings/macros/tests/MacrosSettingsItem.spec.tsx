import {act, render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {macros} from 'fixtures/macro'
import {OrderDirection} from 'models/api/types'
import {MacroSortableProperties} from 'models/macro/types'

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

describe('<MacrosSettingsItem />', () => {
    const minProps = {
        datetimeFormat: '"MM/DD/YYYY"',
        hasAgentPrivileges: true,
        isArchivingAvailable: false,
        macro: macros[0],
        onMacroDelete: jest.fn(),
        onMacroDuplicate: jest.fn(),
        options: {
            order_by:
                `${MacroSortableProperties.CreatedDatetime}:${OrderDirection.Asc}` as const,
        },
        selectedMacrosIds: [],
        setSelectedMacrosIds: jest.fn(),
    }

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
})
