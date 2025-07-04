import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderResult } from '@testing-library/react'
import { createMemoryHistory, MemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { keyBy } from 'lodash'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { ulid } from 'ulidx'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import ActionsPlatformVisualBuilder from 'pages/automate/actionsPlatform/components/visualBuilder/WorkflowVisualBuilder'
import {
    VisualBuilderContext,
    VisualBuilderContextType,
} from 'pages/automate/workflows/hooks/useVisualBuilder'
import { WorkflowEditorContext } from 'pages/automate/workflows/hooks/useWorkflowEditor'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { RootState } from 'state/types'
import { mockReactFlow } from 'tests/mockedReactFlow'

import WorkflowVisualBuilder from '../editor/visualBuilder/WorkflowVisualBuilder'
import { ConditionsSchema } from '../models/conditions.types'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from '../models/visualBuilderGraph.model'
import {
    AutomatedMessageNodeType,
    CancelOrderNodeType,
    CancelSubscriptionNodeType,
    ChannelTriggerNodeType,
    ConditionsNodeType,
    CreateDiscountCodeNodeType,
    EditOrderNoteNodeType,
    EndNodeType,
    FileUploadNodeType,
    HttpRequestNodeType,
    LLMPromptTriggerNodeType,
    MultipleChoicesNodeType,
    OrderLineItemSelectionNodeType,
    OrderSelectionNodeType,
    RefundOrderNodeType,
    RefundShippingCostsNodeType,
    RemoveItemNodeType,
    ReplaceItemNodeType,
    ReshipForFreeNodeType,
    ReusableLLMPromptCallNodeType,
    ReusableLLMPromptTriggerNodeType,
    ShopperAuthenticationNodeType,
    SkipChargeNodeType,
    TextReplyNodeType,
    UpdateShippingAddressNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
    VisualBuilderTriggerNode,
} from '../models/visualBuilderGraph.types'
import { LanguageCode } from '../models/workflowConfiguration.types'

mockReactFlow()

const mockStore = configureMockStore([thunk])

type BuilderType = 'workflow' | 'actions'

type EdgeInput = {
    source: string
    target: string
    data?: VisualBuilderEdge['data']
}

interface VisualBuildertestOptions {
    builderType: BuilderType
    nodes: VisualBuilderNode[]
    edges?: EdgeInput[]
    currentLanguage?: LanguageCode
    availableLanguages?: LanguageCode[]
    isNew?: boolean
    isDirty?: boolean
    isTesting?: boolean
    workflowName?: string
    nodeEditingId?: string | null
    customContextValues?: Partial<WorkflowEditorContext> | any
    customStoreState?: Partial<RootState>
    route?: string
}

interface VisualBuildertestResult extends RenderResult {
    history: MemoryHistory
    store: any
    queryClient: QueryClient
}

export const nodeHelpers = {
    channelTrigger: (
        label: string = 'Start',
        id?: string,
        data?: Partial<ChannelTriggerNodeType['data']>,
    ): ChannelTriggerNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'channel_trigger',
        data: {
            label,
            label_tkey: `${label}_tkey`,
            ...data,
        },
    }),

    llmPromptTrigger: (
        instructions: string = '',
        id?: string,
        data?: Partial<LLMPromptTriggerNodeType['data']>,
    ): LLMPromptTriggerNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'llm_prompt_trigger',
        data: {
            instructions,
            requires_confirmation: false,
            inputs: [],
            conditionsType: null,
            conditions: [],
            ...data,
        },
    }),

    message: (
        text: string = 'Message',
        id?: string,
        data?: Partial<AutomatedMessageNodeType['data']>,
    ): AutomatedMessageNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'automated_message',
        data: {
            content: {
                html: `<p>${text}</p>`,
                text,
            },
            ...data,
        },
    }),

    choices: (
        choicesData: Array<{ label: string; event_id: string }>,
        text: string = 'Choose an option',
        id?: string,
        data?: Partial<MultipleChoicesNodeType['data']>,
    ): MultipleChoicesNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'multiple_choices',
        data: {
            content: {
                html: `<p>${text}</p>`,
                text,
            },
            choices: choicesData,
            ...data,
        },
    }),

    textReply: (
        text: string = 'Enter text',
        id?: string,
        data?: Partial<TextReplyNodeType['data']>,
    ): TextReplyNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'text_reply',
        data: {
            content: {
                html: `<p>${text}</p>`,
                text,
            },
            ...data,
        },
    }),

    httpRequest: (
        url: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
        id?: string,
        data?: Partial<HttpRequestNodeType['data']>,
    ): HttpRequestNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'http_request',
        data: {
            name: '',
            url,
            method,
            headers: [],
            oauth2TokenSettings: null,
            trackstar_integration_name: null,
            variables: [],
            json: null,
            formUrlencoded: null,
            bodyContentType: null,
            ...data,
        },
    }),

    conditions: (
        id?: string,
        data?: Partial<ConditionsNodeType['data']>,
    ): ConditionsNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'conditions',
        data: { name: 'Conditions', ...data },
    }),

    end: (
        action:
            | 'ask-for-feedback'
            | 'create-ticket'
            | 'end'
            | 'end-success'
            | 'end-failure' = 'end',
        id?: string,
        data?: Partial<EndNodeType['data']>,
    ): EndNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'end',
        data: { action, ...data },
    }),

    cancelOrder: (
        id?: string,
        data?: Partial<CancelOrderNodeType['data']>,
    ): CancelOrderNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'cancel_order',
        data: {
            customerId: 'test',
            orderExternalId: 'test',
            integrationId: 'test',
            ...data,
        },
    }),

    refundOrder: (
        id?: string,
        data?: Partial<RefundOrderNodeType['data']>,
    ): RefundOrderNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'refund_order',
        data: {
            customerId: 'test',
            orderExternalId: 'test',
            integrationId: 'test',
            ...data,
        },
    }),

    cancelSubscription: (
        id?: string,
        data?: Partial<CancelSubscriptionNodeType['data']>,
    ): CancelSubscriptionNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'cancel_subscription',
        data: {
            customerId: 'test',
            subscriptionId: 'test',
            reason: 'test',
            integrationId: 'test',
            ...data,
        },
    }),

    skipCharge: (
        id?: string,
        data?: Partial<SkipChargeNodeType['data']>,
    ): SkipChargeNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'skip_charge',
        data: {
            customerId: 'test',
            chargeId: 'test',
            subscriptionId: 'test',
            integrationId: 'test',
            ...data,
        },
    }),

    removeItem: (
        id?: string,
        data?: Partial<RemoveItemNodeType['data']>,
    ): VisualBuilderNode => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'remove_item',
        data: {
            customerId: 'test',
            orderExternalId: 'test',
            productVariantId: 'test',
            quantity: '1',
            integrationId: 'test',
            ...data,
        },
    }),

    replaceItem: (
        id?: string,
        data?: Partial<ReplaceItemNodeType['data']>,
    ): ReplaceItemNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'replace_item',
        data: {
            customerId: 'test',
            orderExternalId: 'test',
            productVariantId: 'test',
            quantity: '1',
            addedProductVariantId: 'test',
            addedQuantity: '1',
            integrationId: 'test',
            ...data,
        },
    }),

    updateShippingAddress: (
        id?: string,
        data?: Partial<UpdateShippingAddressNodeType['data']>,
    ): UpdateShippingAddressNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'update_shipping_address',
        data: {
            customerId: 'test',
            orderExternalId: 'test',
            name: 'test',
            address1: 'test',
            address2: 'test',
            city: 'test',
            zip: 'test',
            province: 'test',
            country: 'test',
            phone: 'test',
            lastName: 'test',
            firstName: 'test',
            integrationId: 'test',
            ...data,
        },
    }),

    createDiscountCode: (
        id?: string,
        data?: Partial<CreateDiscountCodeNodeType['data']>,
    ): CreateDiscountCodeNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'create_discount_code',
        data: {
            integrationId: 'test',
            discountType: 'percentage',
            amount: '10',
            validFor: '10',
            ...data,
        },
    }),

    refundShippingCosts: (
        id?: string,
        data?: Partial<RefundShippingCostsNodeType['data']>,
    ): RefundShippingCostsNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'refund_shipping_costs',
        data: {
            customerId: 'test',
            orderExternalId: 'test',
            integrationId: 'test',
            ...data,
        },
    }),

    reshipForFree: (
        id?: string,
        data?: Partial<ReshipForFreeNodeType['data']>,
    ): ReshipForFreeNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'reship_for_free',
        data: {
            customerId: 'test',
            orderExternalId: 'test',
            integrationId: 'test',
            ...data,
        },
    }),

    editOrderNote: (
        id?: string,
        data?: Partial<EditOrderNoteNodeType['data']>,
    ): EditOrderNoteNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'edit_order_note',
        data: {
            customerId: 'test',
            note: 'test',
            orderExternalId: 'test',
            integrationId: 'test',
            ...data,
        },
    }),

    orderSelection: (
        text: string = 'Message',
        id?: string,
        data?: Partial<OrderSelectionNodeType['data']>,
    ): OrderSelectionNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'order_selection',
        data: {
            content: {
                html: `<p>${text}</p>`,
                text,
            },
            ...data,
        },
    }),

    orderLineItemSelection: (
        text: string = 'Message',
        id?: string,
        data?: Partial<OrderLineItemSelectionNodeType['data']>,
    ): OrderLineItemSelectionNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'order_line_item_selection',
        data: {
            content: {
                html: `<p>${text}</p>`,
                text,
            },
            ...data,
        },
    }),

    shopperAuthentication: (
        id?: string,
        data?: Partial<ShopperAuthenticationNodeType['data']>,
    ): ShopperAuthenticationNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'shopper_authentication',
        data: {
            integrationId: 1,
            ...data,
        },
    }),

    fileUpload: (
        text: string,
        id?: string,
        data?: Partial<FileUploadNodeType['data']>,
    ): VisualBuilderNode => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'file_upload',
        data: {
            content: {
                html: `<p>${text}</p>`,
                text,
            },
            ...data,
        },
    }),

    reusableLLMPromptTrigger: (
        id?: string,
        data?: Partial<ReusableLLMPromptTriggerNodeType['data']>,
    ): ReusableLLMPromptTriggerNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'reusable_llm_prompt_trigger',
        data: {
            requires_confirmation: false,
            inputs: [],
            conditionsType: null,
            conditions: [],
            ...data,
        },
    }),

    reusableLLMPromptCall: (
        id?: string,
        data?: Partial<ReusableLLMPromptCallNodeType['data']>,
    ): ReusableLLMPromptCallNodeType => ({
        ...buildNodeCommonProperties(),
        id: id || ulid(),
        type: 'reusable_llm_prompt_call',
        data: {
            configuration_id: 'test-config-id',
            configuration_internal_id: 'test-config-internal-id',
            values: {},
            objects: null,
            touched: {},
            errors: null,
            ...data,
        },
    }),
}

export const edgeHelpers = {
    simple: (source: string, target: string): EdgeInput => ({
        source,
        target,
    }),

    withCondition: (
        source: string,
        target: string,
        condition: ConditionsSchema,
    ): EdgeInput => ({
        source,
        target,
        data: {
            conditions: condition,
        },
    }),

    withChoiceEvent: (
        source: string,
        target: string,
        eventId: string,
    ): EdgeInput => ({
        source,
        target,
        data: {
            event: {
                id: eventId,
                kind: 'choices',
            },
        },
    }),
}

export function createVisualBuilderGraph(
    builderType: BuilderType,
    nodes: VisualBuilderNode[],
    edges: EdgeInput[] = [],
    options: {
        name?: string
        availableLanguages?: LanguageCode[]
        nodeEditingId?: string | null
        isDraft?: boolean
        isTemplate?: boolean
    } = {},
):
    | VisualBuilderGraph<ChannelTriggerNodeType>
    | VisualBuilderGraph<VisualBuilderTriggerNode> {
    const mappedNodes: VisualBuilderNode[] = nodes.map(
        (node) =>
            ({
                ...buildNodeCommonProperties(),
                id: node.id,
                type: node.type,
                data: node.data,
            }) as VisualBuilderNode,
    )

    let triggerNode: ChannelTriggerNodeType | VisualBuilderTriggerNode
    let fullNodes = mappedNodes

    const firstNode = fullNodes[0]
    const triggerTypes = [
        'channel_trigger',
        'llm_prompt_trigger',
        'reusable_llm_prompt_trigger',
    ]

    // If the first node isn't a trigger, create a default one
    if (
        !firstNode ||
        !firstNode.type ||
        !triggerTypes.includes(firstNode.type)
    ) {
        triggerNode =
            builderType === 'workflow'
                ? nodeHelpers.channelTrigger()
                : nodeHelpers.llmPromptTrigger()

        if (!firstNode) {
            fullNodes = [triggerNode]
        } else {
            fullNodes = [triggerNode, ...fullNodes]
        }
    } else {
        triggerNode = fullNodes[0] as ChannelTriggerNodeType
    }

    const fullEdges: VisualBuilderEdge[] = edges.map((edge) => ({
        ...buildEdgeCommonProperties(),
        id: edge.source + '_' + edge.target,
        source: edge.source,
        target: edge.target,
        data: edge.data,
    }))

    return {
        id: `${builderType}-test-id`,
        nodeEditingId: options.nodeEditingId ?? triggerNode.id,
        internal_id: `${builderType}-test-internal-id`,
        is_draft: options.isDraft ?? false,
        isTemplate: options.isTemplate ?? false,
        name: options.name || `${builderType}-test-name`,
        nodes: [triggerNode, ...fullNodes.slice(1)],
        edges: fullEdges,
        available_languages: options.availableLanguages || [
            'en-US' as LanguageCode,
        ],
        choiceEventIdEditing: null,
        branchIdsEditing: [],
    }
}

const createDefaultWorkflowContextValue = (
    visualBuilderGraph: VisualBuilderGraph<ChannelTriggerNodeType>,
    overrides?: Partial<WorkflowEditorContext>,
): WorkflowEditorContext => ({
    configuration: {
        available_languages: visualBuilderGraph.available_languages,
        id: visualBuilderGraph.id,
        initial_step_id: '1',
        internal_id: visualBuilderGraph.internal_id,
        is_draft: visualBuilderGraph.is_draft,
        name: visualBuilderGraph.name,
        steps: [],
        transitions: [],
    },
    configurationSizeToLimitRate: 500,
    currentLanguage: visualBuilderGraph.available_languages[0] || 'en-US',
    deleteTranslation: jest.fn(),
    dispatch: jest.fn(),
    handleDiscard: jest.fn(),
    handlePublish: jest.fn(),
    handleSave: jest.fn(),
    handleValidate: jest.fn(),
    isDirty: false,
    isFetchPending: false,
    isFlowPublishingInChannels: true,
    isPublishPending: false,
    isSavePending: false,
    isTesting: false,
    setFlowPublishingInChannels: jest.fn(),
    setIsTesting: jest.fn(),
    setWorkflowStepMetrics: jest.fn(),
    setZoom: jest.fn(),
    switchLanguage: jest.fn(),
    translateGraph: jest.fn(),
    translateKey: jest.fn(),
    translationSizeToLimitRate: 500,
    visualBuilderGraph,
    workflowStepMetrics: null,
    zoom: 1,
    handleValidateSize: jest.fn(),
    ...overrides,
})

const createDefaultActionsPlatformContextValue = (
    overrides?: Partial<VisualBuilderContextType>,
): Partial<VisualBuilderContextType> => ({
    checkNodeHasVariablesUsedInChildren: () => false,
    dispatch: jest.fn(),
    getVariableListInChildren: () => [],
    checkNewVisualBuilderNode: () => false,
    getVariableListForNode: jest.fn().mockReturnValue([]),
    isNew: false,
    ...overrides,
})

const createDefaultStoreState = (overrides?: Partial<RootState>): any => {
    const contactForm = ContactFormFixture

    return {
        integrations: fromJS({
            integrations: [],
        }),
        billing: fromJS(billingState),
        currentAccount: fromJS({ account }),
        entities: {
            contactForm: {
                contactFormsAutomationSettings: {
                    automationSettingsByContactFormId: {
                        [contactForm.id]: {
                            workflows: [],
                            order_management: { enabled: false },
                        },
                    },
                },
                contactForms: {
                    contactFormById: keyBy([contactForm], 'id'),
                },
            },
        },
        ...overrides,
    }
}

export function renderVisualBuilder(
    options: VisualBuildertestOptions,
): VisualBuildertestResult {
    const {
        nodes,
        edges = [],
        builderType = 'workflow',
        currentLanguage = 'en-US',
        availableLanguages = ['en-US'],
        isNew = false,
        isDirty = false,
        isTesting = false,
        workflowName = 'test Workflow',
        nodeEditingId = null,
        customContextValues = {},
        customStoreState = {},
        route = '/',
    } = options

    let visualBuilderGraph = createVisualBuilderGraph(
        builderType,
        nodes,
        edges,
        {
            name: workflowName,
            availableLanguages,
            nodeEditingId,
        },
    )

    const contextValue =
        builderType === 'workflow'
            ? createDefaultWorkflowContextValue(
                  visualBuilderGraph as VisualBuilderGraph<ChannelTriggerNodeType>,
                  {
                      currentLanguage,
                      isDirty,
                      isTesting,
                      ...customContextValues,
                  },
              )
            : createDefaultActionsPlatformContextValue({
                  initialVisualBuilderGraph: visualBuilderGraph,
                  visualBuilderGraph,
                  isNew,
                  ...customContextValues,
              })

    const storeState = createDefaultStoreState(customStoreState)
    const store = mockStore(storeState)

    const history = createMemoryHistory({ initialEntries: [route] })

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    const renderComponent = () => {
        if (builderType === 'workflow') {
            return render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <Router history={history}>
                            <WorkflowEditorContext.Provider
                                value={contextValue as WorkflowEditorContext}
                            >
                                <WorkflowVisualBuilder
                                    isNew={isNew}
                                    dispatch={contextValue.dispatch!}
                                    visualBuilderGraph={
                                        visualBuilderGraph as VisualBuilderGraph<ChannelTriggerNodeType>
                                    }
                                />
                            </WorkflowEditorContext.Provider>
                        </Router>
                    </Provider>
                </QueryClientProvider>,
            )
        }
        return render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <Router history={history}>
                        <VisualBuilderContext.Provider
                            value={contextValue as VisualBuilderContextType}
                        >
                            <ActionsPlatformVisualBuilder
                                isMiniMapHidden={false}
                                isDisabled={false}
                            />
                        </VisualBuilderContext.Provider>
                    </Router>
                </Provider>
            </QueryClientProvider>,
        )
    }

    const result = renderComponent()

    return {
        ...result,
        history,
        store,
        queryClient,
    }
}
