import { payingWithCreditCard } from '@repo/billing/fixtures'
import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
} from 'fixtures/plans'
import {
    useBillingState,
    useInternalProductCatalogPlans,
    useUpdateInternalSubscription,
} from 'models/billing/queries'
import type { InternalProductCatalogPlans } from 'models/billing/types'
import { ProductType } from 'models/billing/types'

import { InternalManagePlanView } from './InternalManagePlanView'

const mockUseGetBillingInternalEstimatesSubscription = jest.fn()
jest.mock('@gorgias/helpdesk-queries', () => ({
    useGetBillingInternalEstimatesSubscription: (...args: unknown[]) =>
        mockUseGetBillingInternalEstimatesSubscription(...args),
}))

jest.mock('models/billing/queries')
jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('pages/common/components/Loader/Loader', () => ({
    __esModule: true,
    default: () => <div role="progressbar" aria-label="Loading" />,
}))

const mockUseBillingState = assumeMock(useBillingState)
const mockUseInternalProductCatalogPlans = assumeMock(
    useInternalProductCatalogPlans,
)
const mockUseUpdateInternalSubscription = assumeMock(
    useUpdateInternalSubscription,
)

const catalogPlans: InternalProductCatalogPlans = {
    [ProductType.Helpdesk]: {
        [basicMonthlyHelpdeskPlan.plan_id]: basicMonthlyHelpdeskPlan,
        [proMonthlyHelpdeskPlan.plan_id]: proMonthlyHelpdeskPlan,
    },
}

function mockMutationHook() {
    mockUseUpdateInternalSubscription.mockReturnValue({
        mutateAsync: jest.fn().mockResolvedValue({ products: {} }),
        isLoading: false,
    } as any)
    mockUseGetBillingInternalEstimatesSubscription.mockReturnValue({
        data: { balance_due: 0, immediate_changes_summary: null },
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
    })
}

function mockLoadingState() {
    mockMutationHook()
    mockUseBillingState.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
    } as any)
    mockUseInternalProductCatalogPlans.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
    } as any)
}

function mockDataReady() {
    mockMutationHook()
    mockUseBillingState.mockReturnValue({
        data: payingWithCreditCard,
        isLoading: false,
        isError: false,
    } as any)
    mockUseInternalProductCatalogPlans.mockReturnValue({
        data: { plans: catalogPlans },
        isLoading: false,
        isError: false,
    } as any)
}

function mockErrorState() {
    mockMutationHook()
    mockUseBillingState.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
    } as any)
    mockUseInternalProductCatalogPlans.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
    } as any)
}

function renderComponent() {
    return render(<InternalManagePlanView />)
}

describe('InternalManagePlanView', () => {
    it('shows loader when data is fetching', () => {
        mockLoadingState()
        renderComponent()

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('shows error message when fetching fails', () => {
        mockErrorState()
        renderComponent()

        expect(
            screen.getByText(
                'An error has occurred: could not fetch billing data',
            ),
        ).toBeInTheDocument()
    })

    it('renders Go Back button, Select Plans heading, and Summary heading when data loads', () => {
        mockDataReady()
        renderComponent()

        expect(
            screen.getByRole('button', { name: /go back/i }),
        ).toBeInTheDocument()
        expect(screen.getByText('Select Plans')).toBeInTheDocument()
        expect(screen.getByText('Summary')).toBeInTheDocument()
    })

    it('updates summary when selecting a different plan from dropdown', async () => {
        const user = userEvent.setup()
        mockDataReady()
        renderComponent()

        const trigger = screen.getByRole('button', { name: /300/ })
        await user.click(trigger)

        const option = await screen.findByText(proMonthlyHelpdeskPlan.plan_id)
        await user.click(option)

        await waitFor(() => {
            expect(screen.getByText('Upgraded')).toBeInTheDocument()
        })
        expect(
            screen.getByRole('button', { name: /preview changes/i }),
        ).toBeEnabled()
    })

    it('opens confirm modal when Preview changes is clicked after selecting a plan', async () => {
        const user = userEvent.setup()
        mockDataReady()
        renderComponent()

        const trigger = screen.getByRole('button', { name: /300/ })
        await user.click(trigger)

        const option = await screen.findByText(proMonthlyHelpdeskPlan.plan_id)
        await user.click(option)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /preview changes/i }),
            ).toBeEnabled()
        })

        await user.click(
            screen.getByRole('button', { name: /preview changes/i }),
        )

        await waitFor(() => {
            expect(screen.getByText('Confirm changes')).toBeInTheDocument()
        })
        expect(
            screen.getByRole('button', { name: /apply with invoice/i }),
        ).toBeInTheDocument()
    })
})
