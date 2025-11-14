import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import CustomerNameBodyCell from 'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/CustomerNameBodyCell'
import { renderWithRouter } from 'utils/testing'

describe('<CustomerNameBodyCell>', () => {
    it('should render customer name', () => {
        const { getByText } = renderWithRouter(
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
        const { container } = renderWithRouter(
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
        expect(link?.getAttribute('href')).toEqual('/app/customer/1')
    })

    it('should render NOT_AVAILABLE_PLACEHOLDER when customerName is not provided', () => {
        const { getByText } = renderWithRouter(
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
