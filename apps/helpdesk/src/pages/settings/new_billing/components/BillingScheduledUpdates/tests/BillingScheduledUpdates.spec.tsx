import { render } from '@repo/testing'

import { InvoiceCadence } from '@gorgias/helpdesk-types'

import {
    advancedMonthlyAutomatePlan,
    advancedMonthlyHelpdeskPlan,
    automate05YearlyMeteredPlan,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    basicYearlyAutomationPlan,
    basicYearlyHelpdeskPlan,
    convertPlan1,
    proMonthlyAutomationPlan,
    smsPlan1,
    voicePlan1,
} from 'fixtures/plans'
import useScheduledChangesNotifications from 'pages/settings/new_billing/hooks/useScheduledChangesNotifications'

import BillingScheduledUpdates from '../BillingScheduledUpdates'

jest.mock('pages/settings/new_billing/hooks/useScheduledChangesNotifications')

const mockUseScheduledChangesNotifications =
    useScheduledChangesNotifications as jest.Mock

describe('BillingScheduledUpdates', () => {
    beforeEach(() => {
        mockUseScheduledChangesNotifications.mockReturnValue({
            loading: true,
            scheduledUpdates: null,
            error: null,
        })
    })

    it('should return null if the scheduled updates are still loading', () => {
        const { container } = render(<BillingScheduledUpdates />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should render an error if the scheduled updates failed to load', () => {
        const error = new Error('Oh no!')
        mockUseScheduledChangesNotifications.mockReturnValue({
            error,
            loading: false,
            scheduledUpdates: null,
        })

        const { getByText } = render(<BillingScheduledUpdates />)
        expect(
            getByText(
                'Something went wrong while trying to fetch scheduled downgrades.',
            ),
        ).toBeInTheDocument()
    })

    it('should return null if there are no scheduled updates', () => {
        mockUseScheduledChangesNotifications.mockReturnValue({
            loading: false,
            scheduledUpdates: [],
            error: null,
        })

        const { container } = render(<BillingScheduledUpdates />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should render a plan change message for plans being downgraded that will still be in effect after the downgrade', () => {
        mockUseScheduledChangesNotifications.mockReturnValue({
            loading: false,
            scheduledUpdates: [
                {
                    datetime: '2023-03-31T00:00:00Z',
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: basicMonthlyHelpdeskPlan,
                },
            ],
            error: null,
        })

        const { getByText } = render(<BillingScheduledUpdates />)
        expect(getByText('Your plan change for')).toBeInTheDocument()
        expect(getByText('to 300 tickets/month')).toBeInTheDocument()
        expect(getByText('$60/month')).toBeInTheDocument()
        expect(getByText('March 31st 2023.')).toBeInTheDocument()
    })

    it('should render the amount per invoice cadence for a yearly contract billed quarterly', () => {
        const yearlyContractQuarterlyInvoiced = {
            ...basicYearlyHelpdeskPlan,
            invoice_cadence: InvoiceCadence.Quarter,
            amount: 15000,
        }
        mockUseScheduledChangesNotifications.mockReturnValue({
            loading: false,
            scheduledUpdates: [
                {
                    datetime: '2023-03-31T00:00:00Z',
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: yearlyContractQuarterlyInvoiced,
                },
            ],
            error: null,
        })

        const { getByText } = render(<BillingScheduledUpdates />)
        expect(getByText('$150/quarter')).toBeInTheDocument()
    })

    it('should render the amount per invoice cadence for a yearly contract billed monthly', () => {
        const yearlyContractMonthlyInvoiced = {
            ...basicYearlyHelpdeskPlan,
            invoice_cadence: InvoiceCadence.Month,
            amount: 5000,
        }
        mockUseScheduledChangesNotifications.mockReturnValue({
            loading: false,
            scheduledUpdates: [
                {
                    datetime: '2023-03-31T00:00:00Z',
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: yearlyContractMonthlyInvoiced,
                },
            ],
            error: null,
        })

        const { getByText } = render(<BillingScheduledUpdates />)
        expect(getByText('$50/month')).toBeInTheDocument()
    })

    it.each([
        [basicMonthlyHelpdeskPlan, 'Helpdesk'],
        [advancedMonthlyHelpdeskPlan, 'Helpdesk'],
        [basicMonthlyAutomationPlan, 'AI Agent'],
        [basicYearlyAutomationPlan, 'AI Agent'],
        [proMonthlyAutomationPlan, 'AI Agent'],
        [advancedMonthlyAutomatePlan, 'AI Agent'],
        [automate05YearlyMeteredPlan, 'AI Agent'],
        [voicePlan1, 'Voice'],
        [smsPlan1, 'SMS'],
        [convertPlan1, 'Convert'],
    ])(
        'should render the correct product name for cancelled subscriptions',
        (plan, productName) => {
            mockUseScheduledChangesNotifications.mockReturnValue({
                loading: false,
                scheduledUpdates: [
                    {
                        datetime: '2023-03-31T00:00:00Z',
                        currentPlan: plan,
                        targetPlan: null,
                    },
                ],
                error: null,
            })
            const { getByText } = render(<BillingScheduledUpdates />)
            expect(getByText(productName)).toBeInTheDocument()
            expect(getByText('March 31st 2023')).toBeInTheDocument()
        },
    )
})
