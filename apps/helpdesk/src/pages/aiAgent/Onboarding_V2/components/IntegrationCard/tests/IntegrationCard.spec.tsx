import { render, screen } from '@testing-library/react'

import { Tag } from '@gorgias/axiom'

import { IntegrationCard } from '../IntegrationCard'

describe('IntegrationCard', () => {
    it('renders', () => {
        render(
            <IntegrationCard
                icon={<>icon</>}
                status={<Tag color="green">Connected</Tag>}
                buttonLabel="Connect Gmail"
                description="Log into your Gmail or Google Workspace account to allow Gorgias access to emails."
                title="Connect Gmail account"
                onClick={jest.fn()}
            />,
        )

        expect(screen.getByText('Connect Gmail account')).toBeInTheDocument()
        expect(
            screen.getByText(
                /Log into your Gmail or Google Workspace account to allow Gorgias access to emails./,
            ),
        ).toBeInTheDocument()
    })
})
