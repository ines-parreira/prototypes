import { render, screen } from '@testing-library/react'

import { Form } from 'core/forms'
import { assumeMock } from 'utils/testing'

import CustomBusinessHoursIntegrationsTable from '../CustomBusinessHoursIntegrationsTable'
import IntegrationRowsField from '../IntegrationRowsField'

jest.mock('../IntegrationRowsField')
const IntegrationRowsFieldMock = assumeMock(IntegrationRowsField)

const renderComponent = (isLoading?: boolean) => {
    return render(
        <Form onValidSubmit={jest.fn()}>
            <CustomBusinessHoursIntegrationsTable isLoading={isLoading} />
        </Form>,
    )
}

describe('CustomBusinessHoursIntegrationsTable', () => {
    beforeEach(() => {
        IntegrationRowsFieldMock.mockReturnValue(
            <div>IntegrationRowsField</div>,
        )
    })

    it('renders the section header with correct title', () => {
        renderComponent()

        expect(screen.getByText('Integrations')).toBeInTheDocument()
    })

    it('renders the table structure with correct headers', () => {
        renderComponent()

        expect(screen.getByText('Integration')).toBeInTheDocument()
        expect(screen.getByText('Store')).toBeInTheDocument()
        expect(screen.getByText('Business hours')).toBeInTheDocument()
    })

    it('renders the integration rows field in the table body', () => {
        renderComponent()

        expect(screen.getByText('IntegrationRowsField')).toBeInTheDocument()
    })

    it('passes correct props to IntegrationRowsField', () => {
        renderComponent()

        expect(IntegrationRowsFieldMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'assigned_integrations.assign_integrations',
                onItemClick: expect.any(Function),
                numItems: 5,
            }),
            {},
        )
    })

    it('renders the navigation component', () => {
        renderComponent()

        expect(screen.getByText('keyboard_arrow_left')).toBeInTheDocument()
        expect(screen.getByText('keyboard_arrow_right')).toBeInTheDocument()
    })

    it('does not render the navigation, select all and integration rows field when isLoading is true', () => {
        const { container } = renderComponent(true)

        expect(
            screen.queryByText('keyboard_arrow_left'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('keyboard_arrow_right'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('IntegrationRowsField'),
        ).not.toBeInTheDocument()

        const skeletons = container.querySelectorAll(
            '[class^="react-loading-skeleton"]',
        )
        expect(skeletons.length).toBeGreaterThan(0)
    })
})
