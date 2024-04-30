import {useMemo} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {GuidanceTemplateKey, GuidanceTemplate} from '../types'

export const GuidanceTemplatesData: Record<
    GuidanceTemplateKey,
    GuidanceTemplate
> = {
    [GuidanceTemplateKey.DamagedItems]: {
        id: GuidanceTemplateKey.DamagedItems,
        name: 'Damaged or defective item',
        content: `<p>If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).</p>`,
        excerpt:
            'If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).',
        tag: 'Damaged items',
        style: {color: '#3A0F7E', background: '#EDEAFF'},
    },
    [GuidanceTemplateKey.OrderQuestions]: {
        id: GuidanceTemplateKey.OrderQuestions,
        name: 'Order questions without data',
        content: `<p>If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).</p>`,
        excerpt:
            'If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).',
        tag: 'Missing data',
        style: {color: '#3A0F7E', background: '#EDEAFF'},
    },
    [GuidanceTemplateKey.UndeliveredItems]: {
        id: GuidanceTemplateKey.UndeliveredItems,
        name: 'Undelivered items instructions',
        content: `<p>If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).</p>`,
        excerpt:
            'If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).',
        tag: 'Shopping issues',
        style: {color: '#3A0F7E', background: '#EDEAFF'},
    },
    [GuidanceTemplateKey.OrderChanges]: {
        id: GuidanceTemplateKey.OrderChanges,
        name: 'Handle order change requests',
        content: `<p>If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).</p>`,
        excerpt:
            'If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).',
        tag: 'Order changes',
        style: {color: '#3A0F7E', background: '#EDEAFF'},
    },
    [GuidanceTemplateKey.Gifts]: {
        id: GuidanceTemplateKey.Gifts,
        name: 'Gift purchases',
        content: `<p>If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).</p>`,
        excerpt:
            'If no order data is found for a customer asking a question about their order, you will ask the customer to confirm their order number and the email address used to place the order (if not provided already).',
        tag: 'Gifts',
        style: {color: '#3A0F7E', background: '#EDEAFF'},
    },
}

// This is a custom hook that returns the GuidanceTemplatesData object.
// In feature probably we want to fetch this data from the server.
export const useGuidanceTemplates = () => {
    const isGuidanceTemplatesEnabled: undefined | boolean =
        useFlags()[FeatureFlagKey.AiAgentGuidanceTemplates]

    const guidanceTemplates = useMemo(
        () =>
            isGuidanceTemplatesEnabled
                ? Object.values(GuidanceTemplatesData)
                : [],
        [isGuidanceTemplatesEnabled]
    )

    return {guidanceTemplates}
}
