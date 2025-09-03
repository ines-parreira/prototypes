import { render, screen } from '@testing-library/react'

import { httpAction } from 'fixtures/macro'

import { IntegrationsPreview } from '../IntegrationsPreview'

jest.mock('pages/tickets/common/utils', () => ({
    ...jest.requireActual('pages/tickets/common/utils'),
    getSortedIntegrationActions: jest.fn(),
}))

const mockGetSortedIntegrationActions = jest.requireMock(
    'pages/tickets/common/utils',
).getSortedIntegrationActions

describe('<IntegrationsPreview />', () => {
    beforeEach(() => {
        mockGetSortedIntegrationActions.mockReturnValue({
            shopify: [httpAction],
        })
    })

    it('should render integration actions preview', () => {
        render(<IntegrationsPreview actions={[httpAction]} />)

        expect(screen.getByText(/Shopify/)).toBeInTheDocument()
    })

    it('should handle empty actions array', () => {
        mockGetSortedIntegrationActions.mockReturnValue({})

        const { container } = render(<IntegrationsPreview actions={[]} />)

        expect(container.firstChild).toBeNull()
    })

    it('should handle actions with no external execution', () => {
        mockGetSortedIntegrationActions.mockReturnValue({})

        const { container } = render(
            <IntegrationsPreview
                actions={[
                    { name: 'SetStatus', arguments: {}, title: 'SetStatus' },
                ]}
            />,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render multiple integration types', () => {
        const addInternalNoteAction = {
            ...httpAction,
            name: 'AddInternalNoteAction',
        }

        const shopifyAction = {
            ...httpAction,
            name: 'HttpAction',
        }

        mockGetSortedIntegrationActions.mockReturnValue({
            addInternalNote: [addInternalNoteAction],
            http: [httpAction],
            shopify: [shopifyAction],
        })

        render(
            <IntegrationsPreview
                actions={[addInternalNoteAction, httpAction, shopifyAction]}
            />,
        )

        expect(screen.getByText(/Shopify/)).toBeInTheDocument()
        expect(screen.getByText(/Internal note/)).toBeInTheDocument()
        expect(screen.getByText(/Http/)).toBeInTheDocument()
    })
})
