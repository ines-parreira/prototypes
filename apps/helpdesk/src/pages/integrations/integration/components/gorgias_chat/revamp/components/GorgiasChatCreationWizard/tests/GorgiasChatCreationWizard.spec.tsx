import type React from 'react'

import { render } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { GorgiasChatCreationWizardStatus } from 'models/integration/types/gorgiasChat'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import GorgiasChatCreationWizard from '../GorgiasChatCreationWizard'

jest.mock(
    'pages/common/hooks/useIsIntersectingWithBrowserViewport',
    () => () => false,
)
jest.mock('pages/common/hooks/useCollapsibleColumn')

const mockStore = configureMockStore([thunk])

beforeEach(() => {
    ;(useCollapsibleColumn as jest.Mock).mockReturnValue({
        warpToCollapsibleColumn: jest.fn().mockReturnValue(null),
        setIsCollapsibleColumnOpen: jest.fn(),
    })
})

const mockStoreState = {
    currentUser: fromJS({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: { name: 'admin' },
    }),
    integrations: fromJS({
        integrations: [],
    }),
}

const createIntegration = (overrides: Record<string, any> = {}) =>
    fromJS({
        id: 'integration-id',
        name: 'Test Chat',
        meta: { wizard: { status: null } },
        ...overrides,
    })

const emptyLoadingState = fromJS({})

const renderComponent = (
    props: Partial<React.ComponentProps<typeof GorgiasChatCreationWizard>> = {},
    route = '/',
) => {
    const defaultProps = {
        integration: createIntegration(),
        loading: emptyLoadingState,
        isUpdate: false,
    }

    const history = createMemoryHistory({ initialEntries: [route] })

    const result = render(
        <Router history={history}>
            <Provider store={mockStore(mockStoreState)}>
                <GorgiasChatCreationWizard {...defaultProps} {...props} />
            </Provider>
        </Router>,
    )

    return { ...result, history }
}

describe('GorgiasChatCreationWizard (revamp minimal)', () => {
    it('renders create flow breadcrumb', () => {
        const { getByText } = renderComponent()

        expect(getByText('New Chat')).toBeInTheDocument()
        expect(getByText('Chat').closest('a')).toHaveAttribute(
            'href',
            '/app/settings/channels/gorgias_chat',
        )
    })

    it('renders update flow breadcrumb with integration name', () => {
        const integration = createIntegration({ name: 'Updated Chat' })

        const { getByText, queryByText } = renderComponent({
            integration,
            isUpdate: true,
        })

        expect(getByText('Updated Chat')).toBeInTheDocument()
        expect(queryByText('New Chat')).toBeNull()
    })

    it('redirects to chat settings when wizard is published', () => {
        const integration = createIntegration({
            meta: {
                wizard: { status: GorgiasChatCreationWizardStatus.Published },
            },
        })

        const { history } = renderComponent(
            { integration },
            '/app/settings/channels/gorgias_chat/new',
        )

        expect(history.location.pathname).toBe(
            '/app/settings/channels/gorgias_chat',
        )
    })
})
