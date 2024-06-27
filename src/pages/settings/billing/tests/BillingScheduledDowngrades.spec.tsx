import {render} from '@testing-library/react'
import React from 'react'

import {
    advancedMonthlyAutomationPrice,
    advancedMonthlyHelpdeskPrice,
    automate05YearlyMeteredPlan,
    basicMonthlyAutomationPrice,
    basicMonthlyHelpdeskPrice,
    basicYearlyAutomationPrice,
    convertPrice1,
    proMonthlyAutomationPrice,
    smsPrice1,
    voicePrice1,
} from 'fixtures/productPrices'
import useScheduledDowngrades from '../hooks/useScheduledDowngrades'
import BillingScheduledDowngrades from '../BillingScheduledDowngrades'

jest.mock('../hooks/useScheduledDowngrades')

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
                    currentPlan: advancedMonthlyHelpdeskPrice,
                    targetPlan: basicMonthlyHelpdeskPrice,
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
            basicMonthlyHelpdeskPrice,
            'Your subscription to Helpdesk will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            advancedMonthlyHelpdeskPrice,
            'Your subscription to Helpdesk will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            basicMonthlyAutomationPrice,
            'Your subscription to Automate will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            basicYearlyAutomationPrice,
            'Your subscription to Automate will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            proMonthlyAutomationPrice,
            'Your subscription to Automate will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            advancedMonthlyAutomationPrice,
            'Your subscription to Automate will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            automate05YearlyMeteredPlan,
            'Your subscription to Automate will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            voicePrice1,
            'Your subscription to Voice will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            smsPrice1,
            'Your subscription to SMS will end at the end of your billing cycle on March 31st 2023.',
        ],
        [
            convertPrice1,
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
