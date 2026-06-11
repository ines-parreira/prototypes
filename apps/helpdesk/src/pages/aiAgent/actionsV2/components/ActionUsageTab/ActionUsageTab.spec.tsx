import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'

import { GuidanceReferenceContext } from 'pages/aiAgent/actions/providers/GuidanceReferenceContext'
import type { GuidanceReferenceContextType } from 'pages/aiAgent/actions/providers/GuidanceReferenceContext'

import { ActionUsageTab } from './ActionUsageTab'

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')

const ROUTE_PATH = '/app/ai-agent/:shopType/:shopName/actions/edit/:id'
const ROUTE_URL = '/app/ai-agent/shopify/my-shop/actions/edit/cfg-1'

const mockUseAiAgentNavigation = jest.mocked(useAiAgentNavigation)

const configuration = {
    id: 'cfg-1',
    name: 'Get order info',
} as unknown as Parameters<typeof ActionUsageTab>[0]['configuration']

const withGuidanceReferences = (
    references: GuidanceReferenceContextType['references'],
): React.FC<{ children: ReactNode }> => {
    const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
        <GuidanceReferenceContext.Provider
            value={{
                canBeDeleted: (id) => !references[id]?.length,
                references,
            }}
        >
            {children}
        </GuidanceReferenceContext.Provider>
    )
    return Wrapper
}

const renderTab = (
    references: GuidanceReferenceContextType['references'] = {},
) =>
    render(<ActionUsageTab configuration={configuration} />, {
        path: ROUTE_PATH,
        initialEntries: [ROUTE_URL],
        wrapper: withGuidanceReferences(references),
    })

describe('<ActionUsageTab />', () => {
    beforeEach(() => {
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                knowledgeArticle: (type: string, id: number) =>
                    `/app/ai-agent/shopify/my-shop/knowledge/${type}/${id}`,
            },
        } as unknown as ReturnType<typeof useAiAgentNavigation>)
    })

    it('shows the empty state when no guidances reference the action', () => {
        renderTab({})

        expect(
            screen.getByRole('heading', {
                name: 'This action is not referenced by any guidances',
            }),
        ).toBeInTheDocument()
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('renders the usage table with Area and Source columns', () => {
        renderTab({
            'cfg-1': [
                {
                    id: 11,
                    title: 'Refund flow',
                    sourceId: '101',
                },
                {
                    id: 12,
                    title: 'Order cancellation',
                    sourceId: '102',
                },
            ],
        })

        expect(
            screen.getByRole('heading', { name: 'Action usage' }),
        ).toBeInTheDocument()

        const table = screen.getByRole('table')

        expect(
            within(table).getByRole('columnheader', { name: 'Area' }),
        ).toBeInTheDocument()
        expect(
            within(table).getByRole('columnheader', { name: 'Source' }),
        ).toBeInTheDocument()

        const bodyRows = within(table)
            .getAllByRole('row')
            .filter((row) => within(row).queryByRole('link') !== null)
        expect(bodyRows).toHaveLength(2)

        bodyRows.forEach((row) => {
            expect(within(row).getByText('AI Agent')).toBeInTheDocument()
            expect(within(row).getByText('Guidance')).toBeInTheDocument()
        })

        expect(
            within(table).getByRole('link', { name: /Refund flow/ }),
        ).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/my-shop/knowledge/guidance/101',
        )
        expect(
            within(table).getByRole('link', { name: /Order cancellation/ }),
        ).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/my-shop/knowledge/guidance/102',
        )
    })

    it('only renders rows for guidances referencing the current action', () => {
        renderTab({
            'cfg-1': [{ id: 11, title: 'Refund flow', sourceId: '101' }],
            'other-action': [
                { id: 99, title: 'Other guidance', sourceId: '999' },
            ],
        })

        const table = screen.getByRole('table')
        const bodyRows = within(table)
            .getAllByRole('row')
            .filter((row) => within(row).queryByRole('link') !== null)
        expect(bodyRows).toHaveLength(1)
        expect(
            within(table).queryByText('Other guidance'),
        ).not.toBeInTheDocument()
    })
})
