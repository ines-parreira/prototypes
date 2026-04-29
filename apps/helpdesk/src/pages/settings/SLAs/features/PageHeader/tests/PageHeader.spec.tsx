import { render } from '@repo/testing'

import { SectionPageHeader } from 'config/pages'

import PageHeader from '../PageHeader'

describe('<PageHeader/>', () => {
    it('should render a header', () => {
        const { getByText } = render(<PageHeader />)

        expect(getByText(SectionPageHeader.SLAPolicies)).toBeInTheDocument()
    })

    it('should render buttons', () => {
        const { getByText } = render(<PageHeader />)

        expect(getByText('Create SLA')).toBeInTheDocument()
        expect(getByText('Create From Template')).toBeInTheDocument()
    })
})
