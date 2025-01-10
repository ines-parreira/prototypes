import {screen} from '@testing-library/react'
import React from 'react'

import {renderWithRouter} from 'utils/testing'

import ActionsUseCaseTemplatesCards from '../components/ActionsUseCaseTemplatesCards'

jest.mock('../components/UseCaseTemplateModal', () => {
    return () => null
})

describe('<ActionsUseCaseTemplatesCards />', () => {
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
            }
        )

        expect(screen.getByText('Subscriptions')).toBeInTheDocument()
    })
})
