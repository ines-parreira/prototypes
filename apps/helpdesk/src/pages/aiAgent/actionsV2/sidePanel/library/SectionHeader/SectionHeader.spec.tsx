import { render } from '@repo/testing'

import { SectionHeader } from './SectionHeader'

describe('SectionHeader', () => {
    it('renders the label', () => {
        const { getByText } = render(<SectionHeader label="Connected" />)
        expect(getByText('Connected')).toBeInTheDocument()
    })

    it('renders a result count when provided', () => {
        const { getByText } = render(
            <SectionHeader label="Apps" resultCount={2} />,
        )
        expect(getByText('Apps')).toBeInTheDocument()
        expect(getByText('2 results')).toBeInTheDocument()
    })

    it('singularizes the result count for a single match', () => {
        const { getByText } = render(
            <SectionHeader label="Actions" resultCount={1} />,
        )
        expect(getByText('1 result')).toBeInTheDocument()
    })

    it('renders zero results when no matches', () => {
        const { getByText } = render(
            <SectionHeader label="Apps" resultCount={0} />,
        )
        expect(getByText('0 results')).toBeInTheDocument()
    })

    it('applies a custom class name when provided', () => {
        const { container } = render(
            <SectionHeader label="Apps" className="extra-class" />,
        )
        expect(container.firstChild).toHaveClass('extra-class')
    })
})
