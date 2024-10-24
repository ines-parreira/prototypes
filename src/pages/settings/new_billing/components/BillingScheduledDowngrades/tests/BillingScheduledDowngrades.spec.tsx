import {render} from '@testing-library/react'
import React from 'react'

import {
    advancedMonthlyAutomatePlan,
    advancedMonthlyHelpdeskPlan,
    automate05YearlyMeteredPlan,
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    basicYearlyAutomationPlan,
    convertPlan1,
    proMonthlyAutomationPlan,
    smsPlan1,
    voicePlan1,
} from 'fixtures/productPrices'
import BillingScheduledDowngrades from 'pages/settings/new_billing/components/BillingScheduledDowngrades/BillingScheduledDowngrades'
import useScheduledDowngrades from 'pages/settings/new_billing/hooks/useScheduledDowngrades'

jest.mock('pages/settings/new_billing/hooks/useScheduledDowngrades')

const mockUseScheduledDowngrades = useScheduledDowngrades as jest.Mock

describe('BillingScheduledDowngrades', () => {
    beforeEach(() => {
        mockUseScheduledDowngrades.mockReturnValue({loading: true})
    })

    it('should return null if the scheduled downgrades are still loading', () => {
        const {container} = render(<BillingScheduledDowngrades />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should render an error if the scheduled downgrades failed to load', () => {
        const error = new Error('Oh no!')
        mockUseScheduledDowngrades.mockReturnValue({error, loading: false})

        const {getByText} = render(<BillingScheduledDowngrades />)
        expect(
            getByText(
                'Something went wrong while trying to fetch scheduled downgrades.'
            )
        ).toBeInTheDocument()
    })

    it('should return null if there are no scheduled downgrades', () => {
        mockUseScheduledDowngrades.mockReturnValue({loading: false, value: []})

        const {container} = render(<BillingScheduledDowngrades />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should render a downgrade message for plans being downgraded that will still be in effect after the downgrade', () => {
        mockUseScheduledDowngrades.mockReturnValue({
            loading: false,
            value: [
                {
                    datetime: '2023-03-31T00:00:00Z',
                    currentPlan: advancedMonthlyHelpdeskPlan,
                    targetPlan: basicMonthlyHelpdeskPlan,
                },
            ],
        })

        const {getByText} = render(<BillingScheduledDowngrades />)
        const type = 'Helpdesk'
        expect(getByText(type)).toBeInTheDocument()
        const date = 'March 31st 2023'
        expect(getByText(date)).toBeInTheDocument()
        const counter = '300 tickets/month'
        expect(getByText(counter)).toBeInTheDocument()
    })

    it.each([
        [
            basicMonthlyHelpdeskPlan,
            'Your subscription to Helpdesk will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            advancedMonthlyHelpdeskPlan,
            'Your subscription to Helpdesk will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            basicMonthlyAutomationPlan,
            'Your subscription to Automate will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            basicYearlyAutomationPlan,
            'Your subscription to Automate will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            proMonthlyAutomationPlan,
            'Your subscription to Automate will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            advancedMonthlyAutomatePlan,
            'Your subscription to Automate will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            automate05YearlyMeteredPlan,
            'Your subscription to Automate will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            voicePlan1,
            'Your subscription to Voice will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            smsPlan1,
            'Your subscription to SMS will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            convertPlan1,
            'Your subscription to Convert will end at the end of your billing cycle on March 31st 2023.',
        ],
    ])("should render a specific message for unsubscruptions'", (plan, msg) => {
        mockUseScheduledDowngrades.mockReturnValue({
            loading: false,
            value: [
                {
                    datetime: '2023-03-31T00:00:00Z',
                    currentPlan: plan,
                },
            ],
        })
        const {getByText} = render(<BillingScheduledDowngrades />)
        expect(getByText(msg)).toBeInTheDocument()
    })
})
