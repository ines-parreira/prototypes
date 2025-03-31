import React from 'react'

import { render, screen } from '@testing-library/react'

import { UserRole } from 'config/types/user'
import { agents } from 'fixtures/agents'
import { getInitials } from 'gorgias-design-system/Avatar/utils'
import { AI_AGENT_CLIENT_ID } from 'state/agents/constants'

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

        rerender(
            <Row
                agent={{
                    ...agents[1],
                    role: { name: UserRole.Bot },
                    client_id: AI_AGENT_CLIENT_ID,
                    availability_status: undefined,
                }}
            />,
        )

        expect(screen.getByText('Bot'))

        rerender(
            <Row
                agent={{
                    ...agents[1],
                    role: { name: UserRole.Bot },
                    client_id: null,
                    availability_status: undefined,
                }}
            />,
        )

        expect(screen.queryByText('Bot')).not.toBeInTheDocument()
    })

    it('should render 2FA badge when enabled, disabled or N/A', () => {
        const { rerender } = render(<Row agent={agents[0]} />)

        expect(screen.getByText('Disabled'))

        rerender(<Row agent={{ ...agents[1], has_2fa_enabled: true }} />)

        expect(screen.getByText('Enabled'))

        rerender(
            <Row
                agent={{
                    ...agents[1],
                    role: { name: UserRole.Bot },
                    client_id: AI_AGENT_CLIENT_ID,
                }}
            />,
        )

        expect(screen.getByText('N/A'))
    })
})
