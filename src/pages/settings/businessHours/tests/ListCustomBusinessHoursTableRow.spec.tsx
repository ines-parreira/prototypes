import { screen } from '@testing-library/react'

import { Form } from 'core/forms'
import { IntegrationType } from 'models/integration/constants'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { mockedBusinessHours } from '../constants'
import ListCustomBusinessHoursTableRow from '../ListCustomBusinessHoursTableRow'

describe('ListCustomBusinessHoursTableRow', () => {
    it('should render ', () => {
        renderWithStoreAndQueryClientProvider(
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHoursTableRow
                    businessHours={mockedBusinessHours}
                />
            </Form>,
            {},
        )

        expect(screen.getByText('US - Product support')).toBeInTheDocument()
        expect(screen.getByText('US - Sales')).toBeInTheDocument()
        expect(screen.getByText('US / Central')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Mon-Fri, 10:00 AM-6:00 PM | Weekend, 11:00 AM-7:00 PM',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Customer service')).toBeInTheDocument()

        expect(screen.getByText('edit')).toBeInTheDocument()
        expect(screen.getByText('delete')).toBeInTheDocument()
    })

    it('should render badge when integration_count is not 1', () => {
        renderWithStoreAndQueryClientProvider(
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHoursTableRow
                    businessHours={{
                        ...mockedBusinessHours,
                        integration_count: 2,
                    }}
                />
            </Form>,
        )

        expect(screen.getByText('2 integrations')).toBeInTheDocument()
    })

    it('should render integration only when count is 1 and first_integration.store is not defined"', () => {
        renderWithStoreAndQueryClientProvider(
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHoursTableRow
                    businessHours={{
                        ...mockedBusinessHours,
                        first_integration: {
                            integration_id: 1,
                            integration_name: 'Customer service',
                            integration_type: IntegrationType.Phone,
                            store: null,
                        },
                    }}
                />
            </Form>,
        )

        expect(screen.getByText('Customer service')).toBeInTheDocument()
    })
})
