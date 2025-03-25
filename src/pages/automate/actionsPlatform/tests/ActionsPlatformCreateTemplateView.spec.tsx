import React from 'react'

import {
    act,
    createEvent,
    fireEvent,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from 'models/integration/constants'
import {
    useDownloadWorkflowConfigurationStepLogs,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import ActionsPlatformCreateTemplateView from '../ActionsPlatformCreateTemplateView'
import useApps from '../hooks/useApps'
import useCreateActionTemplate from '../hooks/useCreateActionTemplate'

jest.mock('models/workflows/queries')
jest.mock('../hooks/useApps')
jest.mock('../hooks/useCreateActionTemplate')
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('state/integrations/selectors', () => ({
    ...jest.requireActual('state/integrations/selectors'),
    getIntegrationsList: () => [
        { type: 'shopify', count: 1 },
        { type: 'recharge', count: 0 },
    ],
}))

const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseApps = jest.mocked(useApps)
const mockUseCreateActionTemplate = jest.mocked(useCreateActionTemplate)
const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const mockUseDownloadWorkflowConfigurationStepLogs = jest.mocked(
    useDownloadWorkflowConfigurationStepLogs,
)
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])({
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
} as RootState)

mockUseListActionsApps.mockReturnValue({
    data: [
        {
            id: 'someid2',
            auth_type: 'api-key',
            auth_settings: {
                url: 'https://example.com',
            },
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useListActionsApps>)
mockUseApps.mockReturnValue({
    apps: [
        {
            id: 'someid2',
            name: 'test app',
            icon: '/assets/img/integrations/app.png',
            type: IntegrationType.App,
        },
        {
            icon: '/assets/img/integrations/shopify.png',
            id: 'shopify',
            name: 'Shopify',
            type: IntegrationType.Shopify,
        },
        {
            icon: '/assets/img/integrations/recharge.png',
            id: 'recharge',
            name: 'Recharge',
            type: IntegrationType.Recharge,
        },
    ],
    isLoading: false,
} as unknown as ReturnType<typeof mockUseApps>)
mockUseCreateActionTemplate.mockReturnValue({
    createActionTemplate: jest.fn(),
    isLoading: false,
})
mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
    data: [],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
mockUseDownloadWorkflowConfigurationStepLogs.mockReturnValue({
    mutateAsync: jest.fn(),
    isLoading: false,
} as unknown as ReturnType<typeof useDownloadWorkflowConfigurationStepLogs>)

describe('<ActionsPlatformCreateTemplateView />', () => {
    it('should render create template visual builder', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformCreateTemplateView />
            </Provider>,
        )

        act(() => {
            fireEvent.click(screen.getByText('Edit'))
        })

        expect(screen.getByDisplayValue('Untitled Action')).toBeInTheDocument()
    })

    it('should require to select App(s)', async () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformCreateTemplateView />
            </Provider>,
        )

        act(() => {
            fireEvent.focus(
                within(screen.getByRole('combobox')).getByText('Select App(s)'),
            )
        })

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Use'))
        })

        await waitFor(() => {
            expect(screen.queryByText('Select App(s)')).not.toBeInTheDocument()
        })
    })

    it('should create Action template', async () => {
        const mockCreateActionTemplate = jest.fn()

        mockUseCreateActionTemplate.mockReturnValue({
            createActionTemplate: mockCreateActionTemplate,
            isLoading: false,
        })

        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformCreateTemplateView />
            </Provider>,
            {
                history,
            },
        )

        act(() => {
            fireEvent.focus(
                within(screen.getByRole('combobox')).getByText('Select App(s)'),
            )
        })

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Use'))
        })

        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[0], {
                target: { value: 'Some name' },
            })
        })

        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[1], {
                target: { value: 'Some description' },
            })
        })

        act(() => {
            fireEvent.click(screen.getByText('Edit'))
        })

        act(() => {
            fireEvent.click(screen.getByText('add'))
        })

        act(() => {
            fireEvent.click(screen.getByText('HTTP request'))
        })

        act(() => {
            fireEvent.change(screen.queryAllByRole('textbox')[1], {
                target: { value: 'Request name' },
            })
        })

        act(() => {
            const editor = screen
                .getByTestId('visual-builder-node-edition')
                .querySelector('.public-DraftEditor-content')!

            const event = createEvent.paste(editor, {
                clipboardData: {
                    types: ['text/plain'],
                    getData: () => 'https://example.com',
                },
            })

            fireEvent(editor, event)
        })

        act(() => {
            fireEvent.click(screen.getByText('Save'))
        })

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        expect(mockCreateActionTemplate).toHaveBeenCalledWith([
            {
                internal_id: expect.any(String),
            },
            expect.objectContaining({
                name: 'Some name',
                steps: [
                    {
                        id: expect.any(String),
                        kind: 'http-request',
                        settings: expect.objectContaining({
                            headers: {},
                            method: 'GET',
                            name: 'Request name',
                            url: 'https://example.com',
                            variables: [],
                        }),
                    },
                    {
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: true,
                        },
                    },
                    {
                        id: expect.any(String),
                        kind: 'end',
                        settings: {
                            success: false,
                        },
                    },
                ],
                entrypoints: [
                    {
                        kind: 'llm-conversation',
                        trigger: 'llm-prompt',
                        settings: {
                            instructions: 'Some description',
                            requires_confirmation: false,
                        },
                        deactivated_datetime: null,
                    },
                ],
                triggers: [
                    {
                        kind: 'llm-prompt',
                        settings: {
                            custom_inputs: [],
                            object_inputs: [],
                            outputs: [],
                            conditions: null,
                        },
                    },
                ],
            }),
        ])

        await waitFor(() => {
            expect(historyPushSpy).toHaveBeenCalledWith(
                '/app/ai-agent/actions-platform',
            )
        })
    })

    it('should display errors', () => {
        const mockCreateActionTemplate = jest.fn()

        mockUseCreateActionTemplate.mockReturnValue({
            createActionTemplate: mockCreateActionTemplate,
            isLoading: false,
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformCreateTemplateView />
            </Provider>,
        )

        act(() => {
            fireEvent.focus(
                within(screen.getByRole('combobox')).getByText('Select App(s)'),
            )
        })

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Use'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Create Action'))
        })

        expect(mockCreateActionTemplate).not.toHaveBeenCalled()
        expect(screen.getByText('Action name is required')).toBeInTheDocument()
    })

    it('should navigate back to templates page when clicking back button', () => {
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformCreateTemplateView />
            </Provider>,
            { history },
        )

        act(() => {
            fireEvent.click(screen.getByText('Back to templates'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/ai-agent/actions-platform',
        )
    })

    it('should navigate back to templates page when clicking cancel', () => {
        const history = createMemoryHistory()
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <ActionsPlatformCreateTemplateView />
            </Provider>,
            { history },
        )

        act(() => {
            fireEvent.click(screen.getByText('Cancel'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/ai-agent/actions-platform',
        )
    })
})
