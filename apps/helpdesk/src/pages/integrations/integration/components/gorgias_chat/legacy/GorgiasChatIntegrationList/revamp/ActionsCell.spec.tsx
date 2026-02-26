import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { List, Map } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { GorgiasChatCreationWizardStatus } from 'models/integration/types'

import { ActionsCell } from './ActionsCell'

jest.mock('@repo/feature-flags')
jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(() => () => 'https://example.com/oauth/{shop_name}'),
}))
jest.mock('pages/integrations/common/components/ForwardIcon', () => ({
    __esModule: true,
    default: ({ href, onClick }: { href: string; onClick: () => void }) => (
        <a data-testid="forward-icon" href={href} onClick={onClick}>
            Forward
        </a>
    ),
}))

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('ActionsCell', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render "Finish setup" link for draft status', () => {
        const chat = Map({
            id: 123,
            meta: Map({
                wizard: Map({
                    status: GorgiasChatCreationWizardStatus.Draft,
                }),
                shop_integration_id: 456,
                shopify_integration_ids: List([456]),
            }),
        })

        const storeIntegration = Map({})

        render(
            <MemoryRouter>
                <ActionsCell chat={chat} storeIntegration={storeIntegration} />
            </MemoryRouter>,
        )

        expect(screen.getByText('Finish setup')).toBeInTheDocument()
    })

    it('should render ForwardIcon for completed status', () => {
        const chat = Map({
            id: 123,
            meta: Map({
                wizard: Map({
                    status: GorgiasChatCreationWizardStatus.Published,
                }),
                shop_integration_id: 456,
                shopify_integration_ids: List([456]),
            }),
        })
        const storeIntegration = Map({})

        render(
            <MemoryRouter>
                <ActionsCell chat={chat} storeIntegration={storeIntegration} />
            </MemoryRouter>,
        )

        expect(screen.getByTestId('forward-icon')).toBeInTheDocument()
    })

    it('should render "Update permissions" when feature flag is enabled and scope update needed', () => {
        mockUseFlag.mockReturnValue(true)

        const chat = Map({
            id: 123,
            meta: Map({
                wizard: Map({
                    status: GorgiasChatCreationWizardStatus.Published,
                }),
                shop_integration_id: 456,
                shopify_integration_ids: List([456]),
            }),
        })
        const storeIntegration = Map({
            meta: Map({
                need_scope_update: true,
                shop_name: 'test-shop',
            }),
        })

        render(
            <MemoryRouter>
                <ActionsCell chat={chat} storeIntegration={storeIntegration} />
            </MemoryRouter>,
        )

        expect(screen.getByText('Update permissions')).toBeInTheDocument()
    })

    it('should not render "Update permissions" when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        const chat = Map({
            id: 123,
            meta: Map({
                wizard: Map({
                    status: GorgiasChatCreationWizardStatus.Published,
                }),
                shop_integration_id: 456,
                shopify_integration_ids: List([456]),
            }),
        })
        const storeIntegration = Map({
            meta: Map({
                need_scope_update: true,
                shop_name: 'test-shop',
            }),
        })

        render(
            <MemoryRouter>
                <ActionsCell chat={chat} storeIntegration={storeIntegration} />
            </MemoryRouter>,
        )

        expect(screen.queryByText('Update permissions')).not.toBeInTheDocument()
        expect(screen.getByTestId('forward-icon')).toBeInTheDocument()
    })
})
