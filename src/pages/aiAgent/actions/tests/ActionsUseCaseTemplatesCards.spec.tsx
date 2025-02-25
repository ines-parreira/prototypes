import React from 'react'

import { screen } from '@testing-library/react'

import useGetIsActionStepEnabled from 'pages/automate/actionsPlatform/hooks/useGetIsActionStepEnabled'
import { renderWithRouter } from 'utils/testing'

import ActionsUseCaseTemplatesCards from '../components/ActionsUseCaseTemplatesCards'

jest.mock('pages/automate/actionsPlatform/hooks/useGetIsActionStepEnabled')
jest.mock('../components/UseCaseTemplateModal', () => {
    return () => null
})

const mockUseGetIsActionStepEnabled = jest.mocked(useGetIsActionStepEnabled)

describe('<ActionsUseCaseTemplatesCards />', () => {
    beforeEach(() => {
        mockUseGetIsActionStepEnabled.mockReturnValue(
            jest.fn().mockReturnValue(true),
        )
    })

    it('should render use case template card', () => {
        renderWithRouter(
            <ActionsUseCaseTemplatesCards
                templates={[
                    {
                        category: 'Subscriptions',
                        apps: [
                            {
                                type: 'app',
                                app_id: 'someid',
                            },
                        ],
                        available_languages: [],
                        created_datetime: '2021-09-01T00:00:00Z',
                        entrypoints: [
                            {
                                kind: 'llm-conversation',
                                trigger: 'llm-prompt',
                                settings: {
                                    instructions: 'test template',
                                    requires_confirmation: true,
                                },
                                deactivated_datetime: null,
                            },
                        ],
                        id: 'TEMPLATE_ID',
                        initial_step_id: 'some id',
                        internal_id: 'some id',
                        is_draft: false,
                        transitions: [],
                        entrypoint: null,
                        name: 'template name',
                        steps: [
                            {
                                kind: 'reusable-llm-prompt-call',
                                id: 'someid',
                                settings: {
                                    configuration_id: 'step id',
                                    configuration_internal_id: 'some id',
                                    values: {},
                                },
                            },
                        ],
                        triggers: [
                            {
                                kind: 'llm-prompt',
                                settings: {
                                    conditions: {
                                        and: [
                                            {
                                                notEqual: [
                                                    {
                                                        var: 'objects.order.external_status',
                                                    },
                                                    'fulfilled',
                                                ],
                                            },
                                        ],
                                    },
                                    custom_inputs: [],
                                    object_inputs: [],
                                    outputs: [],
                                },
                            },
                        ],
                        updated_datetime: '2021-09-01T00:00:00Z',
                    },
                ]}
                showCustomAction
            />,
            {
                path: '/:shopType/:shopName/ai-agent/actions/templates',
                route: '/shopify/acme/ai-agent/actions/templates',
            },
        )

        expect(screen.getByText('template name')).toBeInTheDocument()
        expect(screen.getByText('Subscriptions')).toBeInTheDocument()
    })

    it('should ignore templates without category or without enabled steps', () => {
        const mockGetIsActionStepEnabled = jest
            .fn()
            .mockImplementation((internalId: string) => {
                switch (internalId) {
                    case 'someid1':
                        return true
                    case 'someid2':
                        return false
                }
            })

        mockUseGetIsActionStepEnabled.mockReturnValue(
            mockGetIsActionStepEnabled,
        )

        renderWithRouter(
            <ActionsUseCaseTemplatesCards
                templates={[
                    {
                        apps: [
                            {
                                type: 'app',
                                app_id: 'someid',
                            },
                        ],
                        available_languages: [],
                        created_datetime: '2021-09-01T00:00:00Z',
                        entrypoints: [
                            {
                                kind: 'llm-conversation',
                                trigger: 'llm-prompt',
                                settings: {
                                    instructions: 'test template',
                                    requires_confirmation: true,
                                },
                                deactivated_datetime: null,
                            },
                        ],
                        id: 'TEMPLATE_ID',
                        initial_step_id: 'some id',
                        internal_id: 'some id',
                        is_draft: false,
                        transitions: [],
                        entrypoint: null,
                        name: 'template name 1',
                        steps: [
                            {
                                kind: 'reusable-llm-prompt-call',
                                id: 'someid',
                                settings: {
                                    configuration_id: 'someid1',
                                    configuration_internal_id: 'someid1',
                                    values: {},
                                },
                            },
                        ],
                        triggers: [
                            {
                                kind: 'llm-prompt',
                                settings: {
                                    custom_inputs: [],
                                    object_inputs: [],
                                    outputs: [],
                                },
                            },
                        ],
                        updated_datetime: '2021-09-01T00:00:00Z',
                    },
                    {
                        apps: [
                            {
                                type: 'app',
                                app_id: 'someid',
                            },
                        ],
                        available_languages: [],
                        created_datetime: '2021-09-01T00:00:00Z',
                        entrypoints: [
                            {
                                kind: 'llm-conversation',
                                trigger: 'llm-prompt',
                                settings: {
                                    instructions: 'test template',
                                    requires_confirmation: true,
                                },
                                deactivated_datetime: null,
                            },
                        ],
                        id: 'TEMPLATE_ID',
                        initial_step_id: 'some id',
                        internal_id: 'some id',
                        is_draft: false,
                        transitions: [],
                        entrypoint: null,
                        name: 'template name 2',
                        steps: [
                            {
                                kind: 'reusable-llm-prompt-call',
                                id: 'someid',
                                settings: {
                                    configuration_id: 'someid2',
                                    configuration_internal_id: 'someid2',
                                    values: {},
                                },
                            },
                        ],
                        triggers: [
                            {
                                kind: 'llm-prompt',
                                settings: {
                                    custom_inputs: [],
                                    object_inputs: [],
                                    outputs: [],
                                },
                            },
                        ],
                        updated_datetime: '2021-09-01T00:00:00Z',
                    },
                ]}
                showCustomAction
            />,
            {
                path: '/:shopType/:shopName/ai-agent/actions/templates',
                route: '/shopify/acme/ai-agent/actions/templates',
            },
        )

        expect(screen.queryByText('template name 1')).not.toBeInTheDocument()
        expect(screen.queryByText('template name 2')).not.toBeInTheDocument()
    })
})
