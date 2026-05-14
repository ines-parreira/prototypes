import { render } from '@repo/testing'

import { LogicConnector } from './LogicConnector'

describe('LogicConnector', () => {
    it('renders "AND" when the operator is "all"', () => {
        const { getByText } = render(<LogicConnector operator="all" />)
        expect(getByText('AND')).toBeInTheDocument()
    })

    it('renders "OR" when the operator is "any"', () => {
        const { getByText } = render(<LogicConnector operator="any" />)
        expect(getByText('OR')).toBeInTheDocument()
    })

    it('hides the connector from assistive technology', () => {
        const { getByText } = render(<LogicConnector operator="all" />)
        const wrapper = getByText('AND').closest('[aria-hidden]')
        expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    })
})
