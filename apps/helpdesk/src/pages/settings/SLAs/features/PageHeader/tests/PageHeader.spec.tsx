import { SectionPageHeader } from 'config/pages'
import { renderWithRouter } from 'utils/testing'

import PageHeader from '../PageHeader'

describe('<PageHeader/>', () => {
    it('should render a header', () => {
        const { getByText } = renderWithRouter(<PageHeader />)

        expect(getByText(SectionPageHeader.SLAPolicies)).toBeInTheDocument()
    })

    it('should render buttons', () => {
        const { getByText } = renderWithRouter(<PageHeader />)

        expect(getByText('Create SLA')).toBeInTheDocument()
        expect(getByText('Create From Template')).toBeInTheDocument()
    })
})
