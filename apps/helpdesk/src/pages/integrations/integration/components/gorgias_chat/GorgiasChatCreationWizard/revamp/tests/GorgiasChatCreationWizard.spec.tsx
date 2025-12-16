import React from 'react'

import { fromJS } from 'immutable'

import { GorgiasChatCreationWizardStatus } from 'models/integration/types/gorgiasChat'
import { renderWithRouter } from 'utils/testing'

import GorgiasChatCreationWizard from '../GorgiasChatCreationWizard'

const createIntegration = (overrides: Record<string, any> = {}) =>
    fromJS({
        id: 'integration-id',
        name: 'Test Chat',
        meta: { wizard: { status: null } },
        ...overrides,
    })

const emptyLoadingState = fromJS({})

describe('GorgiasChatCreationWizard (revamp minimal)', () => {
    it('renders create flow breadcrumb and banner', () => {
        const integration = createIntegration()

        const { getByText } = renderWithRouter(
            <GorgiasChatCreationWizard
                integration={integration}
                loading={emptyLoadingState}
                isUpdate={false}
            />,
        )

        expect(
            getByText('🚧 Revamp mode: under development'),
        ).toBeInTheDocument()
        expect(getByText('New Chat')).toBeInTheDocument()
        expect(getByText('Chat').closest('a')).toHaveAttribute(
            'href',
            '/app/settings/channels/gorgias_chat',
        )
    })

    it('renders update flow breadcrumb with integration name', () => {
        const integration = createIntegration({ name: 'Updated Chat' })

        const { getByText, queryByText } = renderWithRouter(
            <GorgiasChatCreationWizard
                integration={integration}
                loading={emptyLoadingState}
                isUpdate
            />,
        )

        expect(getByText('Updated Chat')).toBeInTheDocument()
        expect(queryByText('New Chat')).toBeNull()
    })

    it('redirects to chat settings when wizard is published', () => {
        const integration = createIntegration({
            meta: {
                wizard: { status: GorgiasChatCreationWizardStatus.Published },
            },
        })

        const { history } = renderWithRouter(
            <GorgiasChatCreationWizard
                integration={integration}
                loading={emptyLoadingState}
                isUpdate={false}
            />,
            { route: '/app/settings/channels/gorgias_chat/new' },
        )

        expect(history.location.pathname).toBe(
            '/app/settings/channels/gorgias_chat',
        )
    })
})
