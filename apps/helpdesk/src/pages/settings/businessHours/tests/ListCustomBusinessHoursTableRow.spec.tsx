import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { mockListBusinessHoursResponse } from '@gorgias/helpdesk-mocks'

import { Form } from 'core/forms'
import useDeleteCustomBusinessHours from 'hooks/businessHours/useDeleteCustomBusinessHours'
import { IntegrationType } from 'models/integration/constants'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import ListCustomBusinessHoursTableRow from '../ListCustomBusinessHoursTableRow'

jest.mock('hooks/businessHours/useDeleteCustomBusinessHours')
jest.mock('state/notifications/actions')

const useDeleteCustomBusinessHoursMock = jest.mocked(
    useDeleteCustomBusinessHours,
)
const mockDelete = jest.fn()
useDeleteCustomBusinessHoursMock.mockReturnValue({
    mutate: mockDelete,
    isLoading: false,
} as any)

describe('ListCustomBusinessHoursTableRow', () => {
    const data = mockListBusinessHoursResponse().data
    const businessHours = mockListBusinessHoursResponse({
        data: [
            {
                ...data[0],
                integration_count: 1,
                first_integration: {
                    ...data[0].first_integration,
                    store: {
                        store_id: 111,
                        store_type: 'store',
                        store_name: 'US - Sales',
                    },
                    integration_id: 1,
                    integration_name: 'name',
                    integration_type: 'type',
                },
            },
        ],
    }).data[0]

    beforeEach(() => {
        mockDelete.mockClear()
    })

    it('should render ', () => {
        renderWithStoreAndQueryClientProvider(
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHoursTableRow
                    businessHours={businessHours}
                />
            </Form>,
            {},
        )

        expect(screen.getByText(businessHours.name)).toBeInTheDocument()
        expect(
            screen.getByText(businessHours.business_hours_config.timezone),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                businessHours.first_integration?.store!.store_name!,
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('edit')).toBeInTheDocument()
        expect(screen.getByText('delete')).toBeInTheDocument()
    })

    it('should render badge when integration_count is not 1', () => {
        renderWithStoreAndQueryClientProvider(
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHoursTableRow
                    businessHours={{
                        ...businessHours,
                        integration_count: 2,
                    }}
                />
            </Form>,
        )

        expect(screen.getByText('2 integrations')).toBeInTheDocument()
    })

    it('should render integration only when count is 1 and store is not defined', () => {
        renderWithStoreAndQueryClientProvider(
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHoursTableRow
                    businessHours={{
                        ...businessHours,
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
        expect(screen.queryByText('US - Sales')).not.toBeInTheDocument()
    })

    it('should render dash when integration_count is 0', () => {
        renderWithStoreAndQueryClientProvider(
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHoursTableRow
                    businessHours={{
                        ...businessHours,
                        integration_count: 0,
                        first_integration: null,
                    }}
                />
            </Form>,
        )

        expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should delete business hours when delete button is clicked and confirmed', async () => {
        const user = userEvent.setup()

        renderWithStoreAndQueryClientProvider(
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHoursTableRow
                    businessHours={businessHours}
                />
            </Form>,
        )

        await user.click(screen.getByText('delete'))

        expect(
            screen.getByText(
                `You are about to delete '${businessHours.name}' business hours.`,
            ),
        ).toBeInTheDocument()

        await user.click(screen.getByText('Confirm'))

        expect(mockDelete).toHaveBeenCalledWith({
            id: businessHours.id,
        })
    })

    it('should handle deletion error', async () => {
        const user = userEvent.setup()

        useDeleteCustomBusinessHoursMock.mockReturnValue({
            mutate: mockDelete,
            isLoading: false,
            error: new Error('Deletion failed'),
        } as any)

        renderWithStoreAndQueryClientProvider(
            <Form onValidSubmit={jest.fn()}>
                <ListCustomBusinessHoursTableRow
                    businessHours={businessHours}
                />
            </Form>,
        )

        await user.click(screen.getByText('delete'))
        await user.click(screen.getByText('Confirm'))

        expect(mockDelete).toHaveBeenCalledWith({
            id: businessHours.id,
        })
    })
})
