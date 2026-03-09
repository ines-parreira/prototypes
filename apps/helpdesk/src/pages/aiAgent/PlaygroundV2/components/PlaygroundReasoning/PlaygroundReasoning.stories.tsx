import type { ComponentProps } from 'react'
import { useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Map } from 'immutable'
import { noop } from 'lodash'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { appQueryClient } from 'api/queryClient'
import { user } from 'fixtures/users'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import { PlaygroundReasoningStateless } from './PlaygroundReasoning'

const defaultState = {
    currentUser: Map(user),
}

const storyConfig: Meta = {
    title: 'AI Agent/PlaygroundV2/PlaygroundReasoning',
    component: PlaygroundReasoningStateless,
    decorators: [
        (story) => (
            <Provider store={configureMockStore()(defaultState)}>
                <QueryClientProvider client={appQueryClient}>
                    <div
                        style={{
                            maxWidth: '600px',
                            padding: '20px',
                            backgroundColor: '#f5f5f5',
                        }}
                    >
                        {story()}
                    </div>
                </QueryClientProvider>
            </Provider>
        ),
    ],
}

const InteractiveWrapper = (
    props: Omit<
        ComponentProps<typeof PlaygroundReasoningStateless>,
        'status' | 'onToggle'
    > & {
        initialStatus?:
            | 'collapsed'
            | 'expanded'
            | 'loading'
            | 'static'
            | 'error'
    },
) => {
    const [status, setStatus] = useState<
        'collapsed' | 'expanded' | 'loading' | 'static' | 'error'
    >(props.initialStatus ?? 'collapsed')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { initialStatus, ...rest } = props

    return (
        <PlaygroundReasoningStateless
            {...rest}
            status={status}
            onToggle={() =>
                setStatus(status === 'expanded' ? 'collapsed' : 'expanded')
            }
        />
    )
}

type StoryArgs = Omit<
    ComponentProps<typeof PlaygroundReasoningStateless>,
    'status' | 'onToggle'
> & {
    initialStatus?: 'collapsed' | 'expanded' | 'loading' | 'static' | 'error'
}

const Template: StoryFn<StoryArgs> = (args) => {
    return <InteractiveWrapper {...args} onRetry={noop} onOpenPreview={noop} />
}

const baseProps: Omit<
    ComponentProps<typeof PlaygroundReasoningStateless>,
    'status' | 'onToggle'
> = {
    reasoningContent: null,
    reasoningResources: [],
    reasoningMetadata: undefined,
    staticMessage: undefined,
    storeConfiguration: {
        shopName: 'Test Shop',
        shopType: 'shopify',
        executionId: '018d92b9-690f-4d0e-8e96-22f31cf8dcc8',
    },
    onRetry: noop,
    onOpenPreview: noop,
}

// Story 1: Collapsed State
export const Collapsed = Template.bind({})
Collapsed.args = {
    ...baseProps,
    reasoningContent: 'Some reasoning content',
}

// Story 2: Loading State (Generating reasoning)
export const Loading = Template.bind({})
Loading.args = {
    ...baseProps,
    initialStatus: 'loading',
}

// Story 3: Expanded with Response Only
export const ExpandedWithResponseOnly = Template.bind({})
ExpandedWithResponseOnly.args = {
    ...baseProps,
    initialStatus: 'expanded',
    reasoningContent:
        'I helped the customer by providing information about our return policy. The customer wanted to know how to return an item they purchased last week. I explained that they have 30 days from the date of purchase to return any item, and provided them with the return form link.',
    reasoningResources: [],
}

// Story 4: Expanded with Full Details
export const ExpandedWithFullDetails = Template.bind({})
ExpandedWithFullDetails.args = {
    ...baseProps,
    initialStatus: 'expanded',
    reasoningContent: `I helped the customer with their order issue by following these steps:

&nbsp;

<div class="fullDetailsContainer"><div class="fullDetailsHeader">Full details:</div>

<div class="taskItem">

1. **Looked up the order**

I searched for the customer's order using their email address and found order #12345.

</div>

<div class="taskItem">

2. **Checked shipping status**

I verified that the order was shipped on January 15th and is currently in transit. The tracking number shows it should arrive within 2-3 business days.

</div>

<div class="taskItem">

3. **Outcome**

Provided the customer with the tracking information and estimated delivery date. The customer was satisfied with the response.

</div></div>`,
    reasoningResources: [],
}

// Story 5: Expanded with Resources
export const ExpandedWithResources = Template.bind({})
ExpandedWithResources.args = {
    ...baseProps,
    initialStatus: 'expanded',
    reasoningContent:
        'Based on <<<article::100::13608>>>, I provided the customer with information about our shipping policy. The article explains that all orders are shipped within 24 hours and typically arrive in 3-5 business days.',
    reasoningResources: [
        {
            resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            resourceId: '13608',
            resourceSetId: '100',
            resourceTitle: 'Shipping Policy',
        },
    ],
    reasoningMetadata: {
        data: [
            {
                title: 'Shipping Policy',
                content: 'All orders are shipped within 24 hours...',
                url: 'https://help.example.com/shipping',
                isDeleted: false,
                isLoading: false,
            },
        ],
        isLoading: false,
    },
}

// Story 6: Static Message - Handover
export const StaticMessageHandover = Template.bind({})
StaticMessageHandover.args = {
    ...baseProps,
    initialStatus: 'static',
    reasoningContent: '',
    staticMessage:
        'AI Agent was not confident in its answer and handed the ticket over to your team.',
}

// Story 7: Error State
export const ErrorState = Template.bind({})
ErrorState.args = {
    ...baseProps,
    initialStatus: 'error',
}

// Story 8: Expanded with Multiple Resources
export const ExpandedWithMultipleResources = Template.bind({})
ExpandedWithMultipleResources.args = {
    ...baseProps,
    initialStatus: 'expanded',
    reasoningContent: `I addressed the customer's question by referencing multiple resources:

- <<<article::100::13608>>> explains our return policy
- <<<guidance::50::789>>> provides guidance on processing refunds
- <<<order::order-12345>>> shows the customer's order details

Based on these resources, I confirmed that the customer is eligible for a full refund.`,
    reasoningResources: [
        {
            resourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
            resourceId: '13608',
            resourceSetId: '100',
            resourceTitle: 'Return Policy',
        },
        {
            resourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
            resourceId: '789',
            resourceSetId: '50',
            resourceTitle: 'Refund Processing Guide',
        },
        {
            resourceType: AiAgentKnowledgeResourceTypeEnum.ORDER,
            resourceId: 'order-12345',
            resourceTitle: 'Order #12345',
        },
    ],
    reasoningMetadata: {
        data: [
            {
                title: 'Return Policy',
                content: 'Customers can return items within 30 days...',
                url: 'https://help.example.com/returns',
                isDeleted: false,
                isLoading: false,
            },
            {
                title: 'Refund Processing Guide',
                content: 'Follow these steps to process a refund...',
                url: 'https://help.example.com/refunds',
                isDeleted: false,
                isLoading: false,
            },
            {
                title: 'Order #12345',
                content: 'Order placed on Jan 10, 2024...',
                isDeleted: false,
                isLoading: false,
            },
        ],
        isLoading: false,
    },
}

// Story 9: Expanded with Execution ID
export const ExpandedWithExecutionId = Template.bind({})
ExpandedWithExecutionId.args = {
    ...baseProps,
    initialStatus: 'expanded',
    reasoningContent:
        'I helped the customer by providing information about our return policy. The customer wanted to know how to return an item they purchased last week. I explained that they have 30 days from the date of purchase to return any item, and provided them with the return form link.',
    reasoningResources: [],
    shouldDisplayExecutionId: true,
}

export default storyConfig
