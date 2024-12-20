import {Macro} from '@gorgias/api-queries'
import {render, screen} from '@testing-library/react'
import React from 'react'
import {useParams} from 'react-router-dom'

import {macros as macrosFixtures} from 'fixtures/macro'
import {MacrosState} from 'state/entities/macros/types'
import {assumeMock} from 'utils/testing'

import MoreActions from '../MoreActions'

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useParams: jest.fn(),
            Link: jest.fn(
                ({children}: {children: React.ReactNode}) => children
            ),
            NavLink: ({children}: {children: React.ReactNode}) => children,
        }) as Record<string, unknown>
)
const mockUseParams = assumeMock(useParams)

describe('<MoreActions />', () => {
    beforeEach(() => {
        mockUseParams.mockReturnValue({
            activeTab: '',
        })
    })

    const macrosState: MacrosState = macrosFixtures.reduce(
        (acc: MacrosState, macro: Macro) => ({
            ...acc,
            [macro.id!]: macro,
        }),
        {}
    )

    const props = {
        hasAgentPrivileges: false,
        macro: macrosFixtures[0],
        macros: macrosState,
        handleMacroDelete: jest.fn(),
        handleMacroDuplicate: jest.fn(),
    }

    it('should display disabled action buttons', () => {
        render(<MoreActions {...props} />)

        expect(screen.getByLabelText('Archive macro')).toBeAriaDisabled()
        expect(
            screen.getByLabelText('More actions on macro')
        ).toBeAriaDisabled()
    })

    it('should archive macro', () => {
        render(<MoreActions {...props} hasAgentPrivileges />)

        screen.getByLabelText('Archive macro').click()

        expect(screen.getByLabelText('Archive macro')).toBeAriaEnabled()
    })

    it('should duplicate macro', () => {
        render(<MoreActions {...props} hasAgentPrivileges />)

        screen.getByLabelText('More actions on macro').click()
        screen.getByText(/Make a copy/).click()

        expect(props.handleMacroDuplicate).toHaveBeenCalled()
    })

    it('should delete macro', () => {
        render(<MoreActions {...props} hasAgentPrivileges />)

        screen.getByLabelText('More actions on macro').click()
        screen.getByText(/Delete/).click()

        expect(screen.getByText(/You are about to delete/)).toBeInTheDocument()

        screen.getByText(/Confirm/).click()

        expect(props.handleMacroDelete).toHaveBeenCalled()
        expect(props.handleMacroDelete).toHaveBeenCalled()
    })

    it('should display `unarchive` action', () => {
        mockUseParams.mockReturnValue({
            activeTab: 'archived',
        })
        render(<MoreActions {...props} hasAgentPrivileges />)

        expect(screen.getByLabelText('Unarchive macro')).toBeInTheDocument()
        expect(screen.getByText('unarchive')).toBeInTheDocument()
    })
})
