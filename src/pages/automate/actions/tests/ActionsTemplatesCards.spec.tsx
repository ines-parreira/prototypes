import {act, fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import React from 'react'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'

import {renderWithRouter} from 'utils/testing'

import ActionsTemplatesCards from '../components/ActionsTemplatesCards'
import {TemplateConfiguration} from '../types'

jest.mock('common/flags')

jest.mock('../components/UseCaseTemplateConfirmationModal', () => {
    return () => null
})

jest.mock(
    '../components/AppActionTemplateCard',
    () =>
        ({templateName}: {templateName: string}) => (
            <div>app template: {templateName}</div>
        )
)
jest.mock(
    '../components/NativeActionTemplateCard',
    () =>
        ({templateName}: {templateName: string}) => (
            <div>native template: {templateName}</div>
        )
)

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('<ActionsTemplatesCards />', () => {
    it('should render action template cards', () => {
        renderWithRouter(
            <ActionsTemplatesCards
                templateConfigurations={[
                    {
                        id: 'testid1',
                        internal_id: 'testinternal_id1',
                        name: 'test1',
                        apps: [
                            {
                                type: 'app',
                                app_id: 'someid',
                            },
                        ],
                    } as TemplateConfiguration,
                    {
                        id: 'testid2',
                        internal_id: 'testinternal_id2',
                        name: 'test2',
                        apps: [
                            {
                                type: 'shopify',
                            },
                        ],
                    } as TemplateConfiguration,
                ]}
            />
        )

        expect(screen.getByText('app template: test1')).toBeInTheDocument()
        expect(screen.getByText('native template: test2')).toBeInTheDocument()
    })

    it('should render create custom Action card', () => {
        const history = createMemoryHistory({
            initialEntries: ['/shopify/acme/ai-agent/actions/templates'],
        })

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <ActionsTemplatesCards
                templateConfigurations={[]}
                showCustomAction
            />,
            {
                history,
                path: '/:shopType/:shopName/ai-agent/actions/templates',
                route: '/shopify/acme/ai-agent/actions/templates',
            }
        )

        act(() => {
            fireEvent.click(screen.getByText('Create custom Action'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/shopify/acme/ai-agent/actions/new'
        )
    })

    it('should render use case template card', () => {
        mockUseFlag.mockReturnValue({
            [FeatureFlagKey.ActionsMultiStep]: true,
        })
        renderWithRouter(
            <ActionsTemplatesCards
                templateConfigurations={[
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
