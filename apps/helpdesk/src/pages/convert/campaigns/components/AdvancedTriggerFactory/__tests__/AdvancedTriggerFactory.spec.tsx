import React from 'react'

import { assumeMock } from '@repo/testing'

import {
    useProductsFromShopifyIntegration,
    useShopifyTags,
} from 'models/integration/queries'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import { AdvancedTriggerFactory } from 'pages/convert/campaigns/components/AdvancedTriggerFactory/AdvancedTriggerFactory'
import { TRIGGERS_CONFIG } from 'pages/convert/campaigns/constants/triggers'
import { useIntegrationContext } from 'pages/convert/campaigns/containers/IntegrationProvider'
import { useTriggers } from 'pages/convert/campaigns/containers/TriggersProvider'
import { CampaignTriggerType } from 'pages/convert/campaigns/types/enums/CampaignTriggerType.enum'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

jest.mock('pages/convert/campaigns/containers/TriggersProvider')
const useTriggersMock = assumeMock(useTriggers)

jest.mock('pages/common/hooks/useIsConvertSubscriber')
const useIsConvertSubscriberMock = assumeMock(useIsConvertSubscriber)

jest.mock('models/integration/queries')
const useShopifyTagsMock = assumeMock(useShopifyTags)
const useProductsFromShopifyIntegrationMock = assumeMock(
    useProductsFromShopifyIntegration,
)

jest.mock('pages/convert/campaigns/containers/IntegrationProvider')
const integrationContextMock = assumeMock(useIntegrationContext)

describe('AdvancedTriggerFactory', () => {
    const customLabels = {
        [CampaignTriggerType.ProductTags]: 'Product In Cart',
        [CampaignTriggerType.CustomerTags]: 'Customer shopify tags',
    } as unknown as any

    beforeEach(() => {
        useIsConvertSubscriberMock.mockReturnValue(true)
        useTriggersMock.mockReturnValue({
            triggers: {},
            areTriggersValid: true,
            onUpdateTrigger: jest.fn(),
            onDeleteTrigger: jest.fn(),
            onTriggerValidationUpdate: jest.fn(),
        })
        useShopifyTagsMock.mockReturnValue({ data: ['tag1'] } as any)
        integrationContextMock.mockReturnValue({
            shopifyIntegration: { id: 1 },
        } as any)
        useProductsFromShopifyIntegrationMock.mockReturnValue({
            data: [
                {
                    item_type: 'product',
                    data: {
                        id: 1,
                        title: 'product1',
                    },
                },
            ],
        } as any)
    })

    it.each(Object.values(CampaignTriggerType))(
        'should render AdvancedTriggerFactory for trigger type %s',
        (type) => {
            const expectedLabel =
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                customLabels[type] || TRIGGERS_CONFIG[type].label
            const trigger = {
                id: '1',
                operator: TRIGGERS_CONFIG[type].defaults.operator,
                value: TRIGGERS_CONFIG[type].defaults.value,
                type,
            }
            const { queryAllByText } = renderWithQueryClientProvider(
                <AdvancedTriggerFactory id="1" trigger={trigger} />,
            )

            if (TRIGGERS_CONFIG[type].requirements.hidden) {
                expect(queryAllByText(expectedLabel, { exact: false })).toEqual(
                    [],
                )
            } else {
                expect(
                    queryAllByText(expectedLabel, { exact: false }),
                ).not.toEqual([])
            }
        },
    )
})
