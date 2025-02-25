import React from 'react'

import { render, screen } from '@testing-library/react'

import { agents } from 'fixtures/agents'
import { getInitials } from 'gorgias-design-system/Avatar/utils'

import Row from '../Row'

describe('<Row />', () => {
    it('should render avatar, name and email', () => {
        render(<Row agent={agents[0]} />)

        expect(screen.getByText(agents[0].name))
        expect(screen.getByText(agents[0].email))
        expect(screen.getByText(getInitials(agents[0].name)))
    })

    it('should render a role or account owner badge', () => {
        const { rerender } = render(<Row agent={agents[0]} />)

        expect(screen.getByText('Lead'))

        rerender(<Row agent={agents[0]} isAccountOwner />)

        expect(screen.getByText('Account Owner'))
    })

    it('should render 2FA badge when enabled or disabled', () => {
        const { rerender } = render(<Row agent={agents[0]} />)

        expect(screen.getByText('Disabled'))

        rerender(<Row agent={{ ...agents[1], has_2fa_enabled: true }} />)

        expect(screen.getByText('Enabled'))
    })
})
