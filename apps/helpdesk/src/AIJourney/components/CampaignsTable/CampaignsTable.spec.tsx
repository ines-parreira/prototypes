import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JourneyApiDTO } from '@gorgias/convert-client'

import CampaignsTable from './CampaignsTable'
import { columns } from './Columns'

const mockFields: JourneyApiDTO[] = [
    {
        id: '1',
        account_id: 1,
        created_datetime: '2025-07-04T12:24:29.121874',
        state: 'active',
        store_integration_id: 2,
        store_name: 'test-store',
        store_type: 'shopify',
        type: 'campaign',
        campaign: {
            title: 'Welcome campaign',
            state: 'draft',
        },
    },
    {
        id: '2',
        account_id: 1,
        created_datetime: '2025-07-04T12:24:29.121874',
        state: 'active',
        store_integration_id: 2,
        store_name: 'test-store',
        store_type: 'shopify',
        type: 'campaign',
        campaign: {
            title: 'Win back campaign',
            state: 'sent',
        },
    },
]

describe('CampaignsTable', () => {
    let queryClient: QueryClient

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })

        jest.clearAllMocks()
    })

    it('should render table with data', () => {
        render(<CampaignsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        expect(screen.getByText('Welcome campaign')).toBeInTheDocument()
        expect(screen.getByText('Win back campaign')).toBeInTheDocument()
    })

    it('should open remove modal when remove button is clicked', async () => {
        render(<CampaignsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        const buttons = screen.getAllByRole('button')
        const removeButtons = buttons.filter(
            (btn) => !btn.id.startsWith('control-visibility'),
        )

        if (removeButtons.length > 1) {
            await act(async () => {
                await userEvent.click(removeButtons[1])
            })
        }

        await waitFor(() => {
            expect(screen.getByText('Delete Campaign?')).toBeInTheDocument()
        })
    })

    it('should render loading state', () => {
        render(
            <CampaignsTable columns={columns} data={[]} isLoading={true} />,
            { wrapper },
        )

        expect(screen.getByRole('table')).toBeInTheDocument()
    })

    it('should filter data based on search input', async () => {
        render(<CampaignsTable columns={columns} data={mockFields} />, {
            wrapper,
        })

        const searchInput = screen.getByRole('textbox')
        await userEvent.type(searchInput, 'Welcome campaign')

        await waitFor(() => {
            expect(screen.getByText('Welcome campaign')).toBeInTheDocument()
            expect(
                screen.queryByText('Win back campaign'),
            ).not.toBeInTheDocument()
        })
    })
})
