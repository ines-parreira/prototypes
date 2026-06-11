import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'

import { AutonomousCell } from '../AutonomousCell'

const makeAction = (isStandalone: boolean): StoreWorkflowsConfiguration =>
    ({
        id: 'action-1',
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    instructions: '',
                    requires_confirmation: false,
                    is_standalone: isStandalone,
                },
            },
        ],
    }) as unknown as StoreWorkflowsConfiguration

describe('AutonomousCell', () => {
    it('renders an image with the "Autonomous" accessible name when standalone', () => {
        render(<AutonomousCell action={makeAction(true)} />)

        expect(
            screen.getByRole('img', { name: /^autonomous$/i }),
        ).toBeInTheDocument()
    })

    it('renders an image with the "Not autonomous" accessible name when not standalone', () => {
        render(<AutonomousCell action={makeAction(false)} />)

        expect(
            screen.getByRole('img', { name: /not autonomous/i }),
        ).toBeInTheDocument()
    })

    it('treats a missing llm-conversation entrypoint as not autonomous', () => {
        const action = {
            id: 'no-entrypoint',
            entrypoints: [],
        } as unknown as StoreWorkflowsConfiguration

        render(<AutonomousCell action={action} />)

        expect(
            screen.getByRole('img', { name: /not autonomous/i }),
        ).toBeInTheDocument()
    })
})
