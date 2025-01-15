import {render, screen} from '@testing-library/react'
import React from 'react'

import StatusBadge, {StatusEnum} from '../../StatusBadge'
import IntegrationCard from '../IntegrationCard'

describe('IntegrationCard', () => {
    it('renders', () => {
        render(
            <IntegrationCard
                icon={<>icon</>}
                status={<StatusBadge status={StatusEnum.Connected} />}
                buttonLabel="Connect Gmail"
                description="Log into your Gmail or Google Workspace account to allow Gorgias access to emails."
                title="Connect Gmail account"
                onClick={jest.fn()}
            />
        )

        expect(screen.getByText('Connect Gmail account')).toBeInTheDocument()
        expect(
            screen.getByText(
                /Log into your Gmail or Google Workspace account to allow Gorgias access to emails./
            )
        ).toBeInTheDocument()
    })
})
