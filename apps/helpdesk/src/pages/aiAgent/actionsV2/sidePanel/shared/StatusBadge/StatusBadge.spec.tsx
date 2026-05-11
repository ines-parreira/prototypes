import { render } from '@repo/testing'

import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
    it('renders the default label for a status kind', () => {
        const { getByText } = render(<StatusBadge status="configured" />)
        expect(getByText('Configured')).toBeInTheDocument()
    })

    it('respects an explicit label override', () => {
        const { getByText } = render(
            <StatusBadge status="failing" label="Action error" />,
        )
        expect(getByText('Action error')).toBeInTheDocument()
    })
})
