import React from 'react'

import { render } from '@testing-library/react'

import {
    convertPlan0,
    proYearlyAutomationPlan,
    proYearlyHelpdeskPlan,
    smsPlan0,
    voicePlan0,
} from 'fixtures/productPrices'
import { Cadence, ProductType } from 'models/billing/types'
import { assumeMock } from 'utils/testing'

import { HELPDESK_CANCELLATION_SCENARIO } from '../../scenarios'
import SummaryBody from '../../UI/SummaryBody'
import SummaryHeader from '../../UI/SummaryHeader'
import CancellationSummary from '../CancellationSummary'

jest.mock('../../UI/SummaryBody')
const SummaryBodyMock = assumeMock(SummaryBody)

jest.mock('../../UI/SummaryHeader')
const SummaryHeaderMock = assumeMock(SummaryHeader)
const componentMockFactory = (testId: string) => () => (
    <div data-testid={testId} />
)

describe('CancellationSummary', () => {
    SummaryBodyMock.mockImplementation(componentMockFactory('summary-body'))
    SummaryHeaderMock.mockImplementation(componentMockFactory('summary-header'))

    const subscriptionProducts = {
        [ProductType.Helpdesk]: {
            ...proYearlyHelpdeskPlan,
            num_quota_tickets: 100,
            amount: 100000,
            currency: 'USD',
            cadence: Cadence.Year,
        },
        [ProductType.Automation]: {
            ...proYearlyAutomationPlan,
            num_quota_tickets: 100,
            amount: 100000,
            currency: 'USD',
            cadence: Cadence.Year,
        },
        [ProductType.SMS]: {
            ...smsPlan0,
            num_quota_tickets: 100,
            amount: 100000,
            currency: 'USD',
            cadence: Cadence.Year,
        },
        [ProductType.Voice]: {
            ...voicePlan0,
            num_quota_tickets: 100,
            amount: 100000,
            currency: 'USD',
            cadence: Cadence.Year,
        },
        [ProductType.Convert]: {
            ...convertPlan0,
            num_quota_tickets: 100,
            amount: 100000,
            currency: 'USD',
            cadence: Cadence.Year,
        },
    }

    it('renders Helpdesk cancellation summary with all products', () => {
        const { getByTestId } = render(
            <CancellationSummary
                subscriptionProducts={subscriptionProducts}
                cancellingProducts={
                    HELPDESK_CANCELLATION_SCENARIO.productsToCancel
                }
                periodEnd="February 14, 2024"
            />,
        )
        expect(getByTestId('summary-body')).toBeInTheDocument()
        expect(SummaryBodyMock).toHaveBeenCalledWith(
            {
                items: [
                    {
                        title: 'Helpdesk',
                        label: 'Pro - ',
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'tickets',
                        amount: '$1,000',
                        strickenOut: true,
                    },
                    {
                        title: 'AI Agent',
                        label: null,
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'AI resolved tickets',
                        amount: '$1,000',
                        strickenOut: true,
                    },
                    {
                        title: 'SMS',
                        label: null,
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'SMS tickets',
                        amount: '$1,000',
                        strickenOut: true,
                    },
                    {
                        title: 'Voice',
                        label: null,
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'voice tickets',
                        amount: '$1,000',
                        strickenOut: true,
                    },
                    {
                        title: 'Convert',
                        label: null,
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'clicks',
                        amount: '$1,000',
                        strickenOut: true,
                    },
                ],
                cadence: 'year',
                total: 0,
            },
            {},
        )

        expect(getByTestId('summary-header')).toBeInTheDocument()
        expect(SummaryHeaderMock).toHaveBeenCalledWith(
            {
                periodEnd: 'February 14, 2024',
            },
            {},
        )
    })

    it('renders with only Voice product stricken out, total of 4000 and Voice product being at the bottom of summary', () => {
        const cancellingProducts = [ProductType.Voice]

        const { getByTestId } = render(
            <CancellationSummary
                subscriptionProducts={subscriptionProducts}
                cancellingProducts={cancellingProducts}
                periodEnd="February 14, 2024"
            />,
        )

        expect(getByTestId('summary-body')).toBeInTheDocument()
        expect(SummaryBodyMock).toHaveBeenCalledWith(
            {
                items: [
                    {
                        title: 'Helpdesk',
                        label: 'Pro - ',
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'tickets',
                        amount: '$1,000',
                        strickenOut: false,
                    },
                    {
                        title: 'AI Agent',
                        label: null,
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'AI resolved tickets',
                        amount: '$1,000',
                        strickenOut: false,
                    },
                    {
                        title: 'SMS',
                        label: null,
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'SMS tickets',
                        amount: '$1,000',
                        strickenOut: false,
                    },
                    {
                        title: 'Convert',
                        label: null,
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'clicks',
                        amount: '$1,000',
                        strickenOut: false,
                    },
                    {
                        title: 'Voice',
                        label: null,
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'voice tickets',
                        amount: '$1,000',
                        strickenOut: true,
                    },
                ],
                cadence: 'year',
                total: 4000,
            },
            {},
        )
        expect(getByTestId('summary-header')).toBeInTheDocument()
        expect(SummaryHeaderMock).toHaveBeenCalledWith(
            {
                periodEnd: 'February 14, 2024',
            },
            {},
        )
    })

    it('renders only the products that are present in the subscription, event if more products are requested to be cancelled', () => {
        const cancellingProducts = [
            ProductType.Helpdesk,
            ProductType.Automation,
            ProductType.SMS,
            ProductType.Voice,
            ProductType.Convert,
        ]

        const { getByTestId } = render(
            <CancellationSummary
                subscriptionProducts={{
                    ...subscriptionProducts,
                    [ProductType.SMS]: null,
                    [ProductType.Voice]: null,
                    [ProductType.Convert]: null,
                }}
                cancellingProducts={cancellingProducts}
                periodEnd="February 14, 2024"
            />,
        )

        expect(SummaryBodyMock).toHaveBeenCalledWith(
            {
                items: [
                    {
                        title: 'Helpdesk',
                        label: 'Pro - ',
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'tickets',
                        amount: '$1,000',
                        strickenOut: true,
                    },
                    {
                        title: 'AI Agent',
                        label: null,
                        cadence: 'year',
                        quotaAmount: 100,
                        counter: 'AI resolved tickets',
                        amount: '$1,000',
                        strickenOut: true,
                    },
                ],
                cadence: 'year',
                total: 0,
            },
            {},
        )

        expect(getByTestId('summary-header')).toBeInTheDocument()
        expect(SummaryHeaderMock).toHaveBeenCalledWith(
            {
                periodEnd: 'February 14, 2024',
            },
            {},
        )
    })
})
