import {render} from '@testing-library/react'
import React from 'react'

import {assumeMock} from '../../../../../../../utils/testing'
import SummaryBody from '../SummaryBody'
import SummaryLineItem from '../SummaryLineItem'
import SummaryTotal from '../SummaryTotal'

jest.mock('../SummaryLineItem')
const SummaryLineItemMock = assumeMock(SummaryLineItem)

jest.mock('../SummaryTotal')
const SummaryTotalMock = assumeMock(SummaryTotal)

describe('SummaryBody', () => {
    SummaryLineItemMock.mockImplementation(() => (
        <div data-testid="summary-line-item" />
    ))
    SummaryTotalMock.mockImplementation(() => (
        <div data-testid="summary-total" />
    ))
    it('renders with two products in the summary', () => {
        const summaryItems = [
            {
                title: 'Helpdesk',
                label: 'Basic - ',
                interval: 'month',
                quotaAmount: 1000,
                counter: 'tickets',
                amount: '$450',
                strickenOut: true,
            },
            {
                title: 'Automate',
                label: null,
                interval: 'month',
                quotaAmount: 1000,
                counter: 'tickets',
                amount: '$550',
                strickenOut: false,
            },
        ]

        const {container, getAllByTestId, getByTestId} = render(
            <SummaryBody items={summaryItems} total={1000} interval={'month'} />
        )
        const bodyHeaderElement = container.querySelector('div[class="header"]')
        expect(bodyHeaderElement).toHaveTextContent('PRODUCT')
        expect(bodyHeaderElement).toHaveTextContent('PRICE')

        const summaryLineItemsElements = getAllByTestId('summary-line-item')
        expect(summaryLineItemsElements).toHaveLength(2)
        summaryLineItemsElements.forEach((lineItemElement) => {
            expect(lineItemElement).toBeInTheDocument()
        })

        const summaryTotalElement = getByTestId('summary-total')
        expect(summaryTotalElement).toBeInTheDocument()
        expect(SummaryTotalMock).toHaveBeenCalledWith(
            {
                total: 1000,
                interval: 'month',
            },
            {}
        )

        const taxNotionElement = container.querySelector(
            'div[class="taxNotion"]'
        )
        expect(taxNotionElement).toHaveTextContent(
            'Prices exclusive of sales tax'
        )
    })
})
