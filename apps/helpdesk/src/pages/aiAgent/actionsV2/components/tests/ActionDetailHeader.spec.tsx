import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useUpsertAction from 'pages/aiAgent/actions/hooks/useUpsertAction'
import GuidanceReferenceContext from 'pages/aiAgent/actions/providers/GuidanceReferenceContext'
import type { StoreWorkflowsConfiguration } from 'pages/aiAgent/actions/types'
import { usePlaygroundPanel } from 'pages/aiAgent/hooks/usePlaygroundPanel'

import { ActionDetailHeader } from '../ActionDetailHeader'

jest.mock('pages/aiAgent/actions/hooks/useUpsertAction')
jest.mock('pages/aiAgent/hooks/usePlaygroundPanel')

const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUsePlaygroundPanel = jest.mocked(usePlaygroundPanel)

const ROUTE_PATH = '/app/ai-agent/:shopType/:shopName/actions/edit/:id'
const ROUTE_URL = '/app/ai-agent/shopify/my-shop/actions/edit/cfg-1'

const baseConfiguration = {
    id: 'cfg-1',
    internal_id: 'cfg-1-internal',
    name: 'Get order info',
    description: 'Fetch order details from Shopify',
    is_draft: false,
    apps: [{ type: 'shopify' }],
    steps: [],
    triggers: [],
    entrypoints: [
        {
            kind: 'llm-conversation',
            trigger: 'llm-prompt',
            settings: {
                instructions: '',
                requires_confirmation: false,
            },
            deactivated_datetime: null,
        },
    ],
} as unknown as StoreWorkflowsConfiguration

const renderHeader = (
    configuration: StoreWorkflowsConfiguration = baseConfiguration,
    canBeDeleted: (id: string) => boolean = () => true,
) =>
    render(
        <GuidanceReferenceContext.Provider
            value={{ canBeDeleted, references: {} }}
        >
            <ActionDetailHeader configuration={configuration} />
        </GuidanceReferenceContext.Provider>,
        {
            path: ROUTE_PATH,
            initialEntries: [ROUTE_URL],
        },
    )

const disabledEntrypointConfig = {
    ...baseConfiguration,
    entrypoints: [
        {
            ...baseConfiguration.entrypoints[0],
            deactivated_datetime: '2024-04-29T13:32:57.190Z',
        },
    ],
} as unknown as StoreWorkflowsConfiguration

describe('ActionDetailHeader', () => {
    const mutate = jest.fn()
    const openPlayground = jest.fn(async () => {})

    beforeAll(() => {
        Element.prototype.getAnimations = () => []
    })

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseUpsertAction.mockReturnValue({
            mutate,
            isLoading: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
        mockUsePlaygroundPanel.mockReturnValue({
            openPlayground,
            closePlayground: jest.fn(),
            togglePlayground: jest.fn(),
            isPlaygroundOpen: false,
        })
    })

    it('renders the action name', () => {
        renderHeader()

        expect(
            screen.getByRole('heading', { name: 'Get order info' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('link', { name: /back to actions library/i }),
        ).not.toBeInTheDocument()
    })

    it('initializes useUpsertAction with update mode and shop params from the URL', () => {
        renderHeader()

        expect(mockUseUpsertAction).toHaveBeenCalledWith(
            'update',
            'my-shop',
            'shopify',
        )
    })

    it('shows the toggle in the enabled state when the entrypoint is active', () => {
        renderHeader()

        const toggle = screen.getByRole('switch', { name: /enabled/i })
        expect(toggle).toBeChecked()
        expect(toggle).toBeEnabled()
    })

    it('shows the toggle in the disabled state when the entrypoint is deactivated', () => {
        renderHeader(disabledEntrypointConfig)

        const toggle = screen.getByRole('switch', { name: /enabled/i })
        expect(toggle).not.toBeChecked()
    })

    it('disables the toggle while the upsert mutation is in flight', () => {
        mockUseUpsertAction.mockReturnValue({
            mutate,
            isLoading: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderHeader()

        const toggle = screen.getByRole('switch', { name: /enabled/i })
        expect(toggle).toBeDisabled()
    })

    it('disables the toggle when the action is enabled and referenced in Guidance', () => {
        renderHeader(baseConfiguration, () => false)

        const toggle = screen.getByRole('switch', { name: /enabled/i })
        expect(toggle).toBeDisabled()
    })

    it('keeps the toggle interactive when the action is disabled even if referenced in Guidance', () => {
        renderHeader(disabledEntrypointConfig, () => false)

        const toggle = screen.getByRole('switch', { name: /enabled/i })
        expect(toggle).toBeEnabled()
    })

    it('calls updateAction with a null deactivated_datetime when toggling from off to on', async () => {
        const user = userEvent.setup()
        renderHeader(disabledEntrypointConfig)

        await user.click(screen.getByRole('switch', { name: /enabled/i }))

        expect(mutate).toHaveBeenCalledTimes(1)
        const [identifier, payload] = mutate.mock.calls[0][0]
        expect(identifier).toEqual({
            internal_id: disabledEntrypointConfig.internal_id,
            store_name: 'my-shop',
            store_type: 'shopify',
        })
        expect(payload.entrypoints[0]).toMatchObject({
            kind: 'llm-conversation',
            deactivated_datetime: null,
        })
    })

    it('calls updateAction with an ISO deactivated_datetime when toggling from on to off', async () => {
        const user = userEvent.setup()
        renderHeader()

        await user.click(screen.getByRole('switch', { name: /enabled/i }))

        expect(mutate).toHaveBeenCalledTimes(1)
        const [, payload] = mutate.mock.calls[0][0]
        const llmEntrypoint = payload.entrypoints.find(
            (entry: { kind: string }) => entry.kind === 'llm-conversation',
        )
        expect(llmEntrypoint.deactivated_datetime).toEqual(expect.any(String))
        expect(() =>
            new Date(llmEntrypoint.deactivated_datetime).toISOString(),
        ).not.toThrow()
    })

    it('does not modify non-llm-conversation entrypoints when toggling', async () => {
        const user = userEvent.setup()
        const otherEntrypoint = {
            kind: 'webhook',
            trigger: 'event',
            settings: {},
            deactivated_datetime: null,
        }
        const configWithMixedEntrypoints = {
            ...baseConfiguration,
            entrypoints: [baseConfiguration.entrypoints[0], otherEntrypoint],
        } as unknown as StoreWorkflowsConfiguration

        renderHeader(configWithMixedEntrypoints)

        await user.click(screen.getByRole('switch', { name: /enabled/i }))

        const [, payload] = mutate.mock.calls[0][0]
        const preservedEntrypoint = payload.entrypoints.find(
            (entry: { kind: string }) => entry.kind === 'webhook',
        )
        expect(preservedEntrypoint).toEqual(otherEntrypoint)
    })

    it('opens the playground when the Test button is clicked', async () => {
        const user = userEvent.setup()
        renderHeader()

        await user.click(screen.getByRole('button', { name: 'Test' }))

        expect(openPlayground).toHaveBeenCalledTimes(1)
    })

    it('disables the Test button when the action is disabled', () => {
        renderHeader(disabledEntrypointConfig)

        const testButton = screen.getByRole('button', { name: 'Test' })
        expect(testButton).toBeDisabled()
        expect(openPlayground).not.toHaveBeenCalled()
    })
})
