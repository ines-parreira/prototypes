import type { ReactNode } from 'react'

import { render, userEvent } from '@repo/testing'

jest.mock('pages/aiAgent/actions/providers/GuidanceReferenceProvider', () => ({
    __esModule: true,
    default: ({ children }: { children?: ReactNode }) => <>{children}</>,
}))

jest.mock('pages/aiAgent/actions/providers/StoreAppsProvider', () => ({
    __esModule: true,
    default: ({ children }: { children?: ReactNode }) => <>{children}</>,
}))

jest.mock('pages/aiAgent/actions/providers/StoreTrackstarProvider', () => ({
    __esModule: true,
    default: ({ children }: { children?: ReactNode }) => <>{children}</>,
}))

jest.mock(
    'pages/automate/actionsPlatform/components/visualBuilder/WorkflowVisualBuilder',
    () => ({
        __esModule: true,
        default: () => <div>Visual builder canvas</div>,
    }),
)

jest.mock('pages/automate/workflows/hooks/useVisualBuilder', () => {
    const { createContext } = require('react') as typeof import('react')
    return {
        __esModule: true,
        useVisualBuilder: () => ({
            visualBuilderGraph: {},
            initialVisualBuilderGraph: {},
            checkNodeHasVariablesUsedInChildren: () => false,
            dispatch: jest.fn(),
            getVariableListInChildren: () => [],
            getVariableListForNode: () => [],
            checkNewVisualBuilderNode: () => false,
            isNew: false,
        }),
        VisualBuilderContext: createContext(null),
    }
})

jest.mock('pages/automate/workflows/hooks/useVisualBuilderGraphReducer', () => {
    const reactModule = require('react') as typeof import('react')
    return {
        __esModule: true,
        useVisualBuilderGraphReducer: () =>
            reactModule.useReducer(
                () => ({ advanced_datetime: '2025-01-01' }),
                {
                    advanced_datetime: '2025-01-01',
                },
            ),
    }
})

jest.mock(
    'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils',
    () => ({
        __esModule: true,
        computeNodesPositions: (graph: unknown) => graph,
    }),
)

jest.mock(
    'pages/automate/workflows/models/workflowConfiguration.model',
    () => ({
        __esModule: true,
        transformWorkflowConfigurationIntoVisualBuilderGraph: () => ({}),
        WorkflowConfigurationBuilder: class {
            build() {
                return {}
            }
        },
    }),
)

import { AdvancedStepsBuilder } from './AdvancedStepsBuilder'

const renderBuilder = (actionName?: string) =>
    render(
        <AdvancedStepsBuilder
            shopName="acme"
            shopType="shopify"
            actionName={actionName}
        />,
    )

describe('AdvancedStepsBuilder', () => {
    it('renders the mini canvas with an edit affordance by default', () => {
        const { getByRole, queryByRole } = renderBuilder('Refund flow')
        expect(
            getByRole('button', { name: /edit advanced action/i }),
        ).toBeInTheDocument()
        expect(
            queryByRole('button', { name: /save advanced action/i }),
        ).not.toBeInTheDocument()
    })

    it('opens the full-screen editor with the action name when the edit button is clicked', async () => {
        const user = userEvent.setup()
        const { getByRole, getByText } = renderBuilder('Refund flow')
        await user.click(getByRole('button', { name: /edit advanced action/i }))
        expect(getByText('Refund flow')).toBeInTheDocument()
        expect(getByText('Advanced action')).toBeInTheDocument()
        expect(
            getByRole('button', { name: /save advanced action/i }),
        ).toBeInTheDocument()
    })

    it('falls back to the default action name when none is provided', async () => {
        const user = userEvent.setup()
        const { getByRole, getByText } = renderBuilder()
        await user.click(getByRole('button', { name: /edit advanced action/i }))
        expect(getByText('Untitled action')).toBeInTheDocument()
    })

    it('saving from the editor footer closes the full-screen view', async () => {
        const user = userEvent.setup()
        const { getByRole, queryByRole } = renderBuilder('Refund flow')
        await user.click(getByRole('button', { name: /edit advanced action/i }))
        await user.click(getByRole('button', { name: /save advanced action/i }))
        expect(
            queryByRole('button', { name: /save advanced action/i }),
        ).not.toBeInTheDocument()
        expect(
            getByRole('button', { name: /edit advanced action/i }),
        ).toBeInTheDocument()
    })

    it('clicking dismiss opens the confirm modal, and discarding exits the editor', async () => {
        const user = userEvent.setup()
        const { getByRole, queryByRole } = renderBuilder('Refund flow')
        await user.click(getByRole('button', { name: /edit advanced action/i }))
        await user.click(getByRole('button', { name: /^dismiss$/i }))
        expect(
            getByRole('heading', { name: /save changes\?/i }),
        ).toBeInTheDocument()
        await user.click(getByRole('button', { name: /discard changes/i }))
        expect(
            queryByRole('button', { name: /save advanced action/i }),
        ).not.toBeInTheDocument()
        expect(
            getByRole('button', { name: /edit advanced action/i }),
        ).toBeInTheDocument()
    })

    it('escape opens the confirm modal, and pressing escape again closes it', async () => {
        const user = userEvent.setup()
        const { getByRole, queryByRole } = renderBuilder('Refund flow')
        await user.click(getByRole('button', { name: /edit advanced action/i }))
        await user.keyboard('{Escape}')
        expect(
            getByRole('heading', { name: /save changes\?/i }),
        ).toBeInTheDocument()
        await user.keyboard('{Escape}')
        expect(
            queryByRole('heading', { name: /save changes\?/i }),
        ).not.toBeInTheDocument()
        // Editor remains open after the confirm dialog is dismissed.
        expect(
            getByRole('button', { name: /save advanced action/i }),
        ).toBeInTheDocument()
    })
})
