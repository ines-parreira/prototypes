import React from 'react'

import { render } from '@testing-library/react'

import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import CustomerNameBodyCell from 'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/CustomerNameBodyCell'

describe('<CustomerNameBodyCell>', () => {
    it('should render customer name', () => {
        const { getByText } = render(
            <table>
                <tbody>
                    <tr>
                        <CustomerNameBodyCell
                            customerName={'John Doe'}
                            surveyCustomerId={'1'}
                        />
                    </tr>
                </tbody>
            </table>,
        )

        expect(getByText('John Doe')).toBeInTheDocument()
    })

    it('should render link', () => {
        const { container } = render(
            <table>
                <tbody>
                    <tr>
                        <CustomerNameBodyCell
                            customerName={'John Doe'}
                            surveyCustomerId={'1'}
                        />
                    </tr>
                </tbody>
            </table>,
        )

        const link = container.querySelector('a')

        expect(link).toBeInTheDocument()
        expect(link?.getAttribute('to')).toEqual('/app/customer/1')
    })

    it('should render NOT_AVAILABLE_PLACEHOLDER when customerName is not provided', () => {
        const { getByText } = render(
            <table>
                <tbody>
                    <tr>
                        <CustomerNameBodyCell
                            customerName={null}
                            surveyCustomerId={'123'}
                        />
                    </tr>
                </tbody>
            </table>,
        )

        expect(getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})
