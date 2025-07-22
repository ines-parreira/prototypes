import { ComponentProps } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { mockListIntegrationsForBusinessHoursResponse } from '@gorgias/helpdesk-mocks'

import { assumeMock } from 'utils/testing'

import BusinessHoursDisplay from '../BusinessHoursDisplay'
import IntegrationRowsField from '../IntegrationRowsField'

jest.mock('../BusinessHoursDisplay')
const BusinessHoursDisplayMock = assumeMock(BusinessHoursDisplay)

const integrations = mockListIntegrationsForBusinessHoursResponse().data

const defaultProps = {
    onChange: jest.fn(),
    onItemClick: jest.fn(),
    value: [],
    integrations,
    name: 'assigned_integrations.assign_integrations',
}

const renderComponent = (
    props?: Partial<ComponentProps<typeof IntegrationRowsField>>,
) => render(<IntegrationRowsField {...defaultProps} {...props} />)

describe('IntegrationRowsField', () => {
    beforeEach(() => {
        BusinessHoursDisplayMock.mockReturnValue(
            <div data-testid="business-hours">BusinessHoursDisplay</div>,
        )
    })

    it('renders correct number of rows based on integrations', () => {
        renderComponent()

        const checkboxes = screen.getAllByRole('checkbox')
        expect(checkboxes).toHaveLength(integrations.length)
    })

    it('renders warning icon', () => {
        renderComponent({ hasWarning: true })

        expect(screen.getAllByText('warning')).toHaveLength(integrations.length)
    })

    it('renders all cells in each row', () => {
        renderComponent()

        expect(screen.getAllByRole('checkbox')).toHaveLength(
            integrations.length,
        )
        expect(screen.getAllByTestId('business-hours')).toHaveLength(
            integrations.length,
        )
        for (let i = 0; i < integrations.length; i++) {
            expect(
                screen.getByText(integrations[i].integration_name),
            ).toBeInTheDocument()
        }
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
})
