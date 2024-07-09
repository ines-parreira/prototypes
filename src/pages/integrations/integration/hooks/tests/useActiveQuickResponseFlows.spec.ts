import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'

import {
    SelfServiceConfiguration,
    ShopType,
} from 'models/selfServiceConfiguration/types'

import {useActiveQuickResponseFlows} from '../useActiveQuickResponseFlows'

const selfServiceConfigurationFixture: SelfServiceConfiguration = {
    id: 1,
    type: 'shopify' as ShopType,
    shopName: `shopify_store`,
    createdDatetime: '2021-01-26T00:29:00Z',
    updatedDatetime: '2021-01-26T00:29:30Z',
    deactivatedDatetime: null,
    reportIssuePolicy: {
        enabled: false,
        cases: [],
    },
    trackOrderPolicy: {
        enabled: false,
    },
    cancelOrderPolicy: {
        enabled: false,
        eligibilities: [],
        exceptions: [],
    },
    returnOrderPolicy: {
        enabled: false,
        eligibilities: [],
        exceptions: [],
    },
    quickResponsePolicies: [
        {
            deactivatedDatetime: null,
            id: 'ded6b39b-a85c-487e-8658-3f380d238528',
            title: 'When do you usually restock?',
            responseMessageContent: {
                html: '<div>Every month</div>',
                text: 'Every month',
                attachments: fromJS([]),
            },
        },
        {
            deactivatedDatetime: '2021-01-26T00:30:00Z',
            id: 'ded6b39b-a85c-487e-8658-3f380d238529',
            title: 'What is my size?',
            responseMessageContent: {
                html: '<div>The moon</div>',
                text: 'The moon',
                attachments: fromJS([]),
            },
        },
    ],
    articleRecommendationHelpCenterId: null,
}

describe('useActiveQuickResponseFlows()', () => {
    describe('missing integration', () => {
        it('returns an empty array', () => {
            const {result} = renderHook(() => useActiveQuickResponseFlows())

            expect(result.current.length).toBe(0)
        })
    })

    it('returns the active flows if there are any', () => {
        const {result} = renderHook(() =>
            useActiveQuickResponseFlows(selfServiceConfigurationFixture)
        )

        expect(result.current[0]).toEqual({
            deactivatedDatetime: null,
            id: 'ded6b39b-a85c-487e-8658-3f380d238528',
            title: 'When do you usually restock?',
            responseMessageContent: {
                html: '<div>Every month</div>',
                text: 'Every month',
                attachments: fromJS([]),
            },
        })
    })

    it('returns empty array if no flow is active', () => {
        const {result} = renderHook(() =>
            useActiveQuickResponseFlows({
                ...selfServiceConfigurationFixture,
                quickResponsePolicies: [
                    {
                        deactivatedDatetime: '2021-01-26T00:30:00Z',
                        id: 'ded6b39b-a85c-487e-8658-3f380d238529',
                        title: 'What is my size?',
                        responseMessageContent: {
                            html: '<div>The moon</div>',
                            text: 'The moon',
                            attachments: fromJS([]),
                        },
                    },
                ],
            })
        )

        expect(result.current.length).toBe(0)
    })
})
