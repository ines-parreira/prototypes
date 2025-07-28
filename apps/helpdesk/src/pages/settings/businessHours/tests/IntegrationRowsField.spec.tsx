import { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { mockIntegrationWithBusinessHoursAndStore } from '@gorgias/helpdesk-mocks'

import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import StoreDisplayName from 'pages/common/components/StoreDisplayName'
import { assumeMock } from 'utils/testing'

import BusinessHoursDisplay from '../BusinessHoursDisplay'
import CustomBusinessHoursIntegrationCell from '../CustomBusinessHoursIntegrationCell'
import IntegrationRowsField from '../IntegrationRowsField'

jest.mock('../BusinessHoursDisplay')
jest.mock('../CustomBusinessHoursIntegrationCell')
jest.mock('pages/common/components/StoreDisplayName')
jest.mock('domains/reporting/pages/common/components/NoDataAvailable')

const BusinessHoursDisplayMock = assumeMock(BusinessHoursDisplay)
const CustomBusinessHoursIntegrationCellMock = assumeMock(
    CustomBusinessHoursIntegrationCell,
)
const StoreDisplayNameMock = assumeMock(StoreDisplayName)
const NoDataAvailableMock = assumeMock(NoDataAvailable)

const integrations = [
    mockIntegrationWithBusinessHoursAndStore(),
    mockIntegrationWithBusinessHoursAndStore(),
    mockIntegrationWithBusinessHoursAndStore(),
    mockIntegrationWithBusinessHoursAndStore(),
]

const defaultProps = {
    onChange: jest.fn(),
    onItemClick: jest.fn(),
    value: [],
    integrations,
    name: 'assigned_integrations.assign_integrations',
    isError: false,
    refetch: jest.fn(),
}

const renderComponent = (
    props?: Partial<ComponentProps<typeof IntegrationRowsField>>,
) => render(<IntegrationRowsField {...defaultProps} {...props} />)

describe('IntegrationRowsField', () => {
    beforeEach(() => {
        BusinessHoursDisplayMock.mockReturnValue(
            <div data-testid="business-hours">BusinessHoursDisplay</div>,
        )
        CustomBusinessHoursIntegrationCellMock.mockReturnValue(
            <div data-testid="integration-cell">
                CustomBusinessHoursIntegrationCell
            </div>,
        )
        StoreDisplayNameMock.mockReturnValue(
            <div data-testid="store-display">StoreDisplayName</div>,
        )
        NoDataAvailableMock.mockReturnValue(
            <div data-testid="no-data">NoDataAvailable</div>,
        )
    })

    it('renders correct number of rows based on integrations', () => {
        renderComponent()

        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes).toHaveLength(integrations.length)
    })

    it('renders warning icon when hasWarning is true', () => {
        renderComponent({ hasWarning: true })

        const warningIcons = screen.getAllByText('warning')
        expect(warningIcons).toHaveLength(integrations.length)
    })

    it('renders all cells in each row', () => {
        renderComponent()

        expect(screen.getAllByRole('checkbox')).toHaveLength(
            integrations.length,
        )
        expect(screen.getAllByTestId('business-hours')).toHaveLength(
            integrations.length,
        )
        expect(screen.getAllByTestId('integration-cell')).toHaveLength(
            integrations.length,
        )
        expect(screen.getAllByTestId('store-display')).toHaveLength(
            integrations.length,
        )
    })

    it('renders checkbox as checked when index is in value array', () => {
        renderComponent({
            value: [
                integrations[0].integration_id,
                integrations[2].integration_id,
            ],
        })

        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes[0]).toBeChecked()
        expect(checkboxes[1]).not.toBeChecked()
        expect(checkboxes[2]).toBeChecked()
    })

    it('calls onChange with added item when clicking unchecked row', () => {
        renderComponent({
            value: [integrations[1].integration_id],
        })

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[0])

        expect(defaultProps.onChange).toHaveBeenCalledWith([
            integrations[1].integration_id,
            integrations[0].integration_id,
        ])
    })

    it('calls onChange with removed item when clicking checked row', () => {
        renderComponent({
            value: [
                integrations[0].integration_id,
                integrations[1].integration_id,
                integrations[2].integration_id,
            ],
        })

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1])

        expect(defaultProps.onChange).toHaveBeenCalledWith([
            integrations[0].integration_id,
            integrations[2].integration_id,
        ])
    })

    it('handles empty value array correctly', () => {
        renderComponent({
            value: [],
        })

        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes).toHaveLength(integrations.length)
        for (let i = 0; i < integrations.length; i++) {
            expect(checkboxes[i]).not.toBeChecked()
        }
    })

    it('renders NoDataAvailable when integrations is empty', () => {
        renderComponent({ integrations: [] })

        expect(screen.getByTestId('no-data')).toBeInTheDocument()
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('renders NoDataAvailable when integrations is undefined', () => {
        renderComponent({ integrations: undefined })

        expect(screen.getByTestId('no-data')).toBeInTheDocument()
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('renders error message when isError is true and no integrations', () => {
        renderComponent({
            integrations: [],
            isError: true,
        })

        expect(screen.getByTestId('no-data')).toBeInTheDocument()
        expect(NoDataAvailableMock).toHaveBeenCalledWith(
            expect.objectContaining({
                description: expect.any(Object),
            }),
            expect.anything(),
        )
    })

    it('calls onItemClick when row is clicked', () => {
        renderComponent()

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[0])

        expect(defaultProps.onItemClick).toHaveBeenCalledWith(
            integrations[0].integration_id,
        )
    })

    it('passes integration address to CustomBusinessHoursIntegrationCell when available', () => {
        const integrationWithAddress = {
            ...integrations[0],
            integration_address: 'custom@example.com',
        }
        renderComponent({
            integrations: [integrationWithAddress],
        })

        expect(CustomBusinessHoursIntegrationCellMock).toHaveBeenCalledWith(
            expect.objectContaining({
                address: 'custom@example.com',
            }),
            expect.anything(),
        )
    })

    it('passes mapped address to CustomBusinessHoursIntegrationCell when integration address is null', () => {
        const facebookIntegration = {
            ...integrations[0],
            integration_type: 'facebook',
            integration_address: null,
        }
        renderComponent({
            integrations: [facebookIntegration],
        })

        expect(CustomBusinessHoursIntegrationCellMock).toHaveBeenCalledWith(
            expect.objectContaining({
                address: 'Facebook',
            }),
            expect.anything(),
        )
    })

    it('passes null address to CustomBusinessHoursIntegrationCell when integration address is null and type has no mapping', () => {
        const unknownIntegration = {
            ...integrations[0],
            integration_type: 'unknown_type',
            integration_address: null,
        }
        renderComponent({
            integrations: [unknownIntegration],
        })

        expect(CustomBusinessHoursIntegrationCellMock).toHaveBeenCalledWith(
            expect.objectContaining({
                address: null,
            }),
            expect.anything(),
        )
    })
})
