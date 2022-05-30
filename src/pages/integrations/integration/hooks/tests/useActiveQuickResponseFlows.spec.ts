import {renderHook} from 'react-hooks-testing-library'
import {fromJS} from 'immutable'

import {
    SelfServiceConfiguration,
    ShopType,
} from 'models/selfServiceConfiguration/types'

import {useActiveQuickResponseFlows} from '../useActiveQuickResponseFlows'

const selfServiceConfigurationFixture: SelfServiceConfiguration = {
    id: 1,
    type: 'shopify' as ShopType,
    shop_name: `shopify_store`,
    created_datetime: '2021-01-26T00:29:00Z',
    updated_datetime: '2021-01-26T00:29:30Z',
    deactivated_datetime: null,
    report_issue_policy: {
        enabled: false,
        cases: [],
    },
    track_order_policy: {
        enabled: false,
    },
    cancel_order_policy: {
        enabled: false,
        eligibilities: [],
        exceptions: [],
    },
    return_order_policy: {
        enabled: false,
        eligibilities: [],
        exceptions: [],
    },
    quick_response_policies: [
        {
            deactivated_datetime: null,
            id: 'ded6b39b-a85c-487e-8658-3f380d238528',
            title: 'When do you usually restock?',
            response_message_content: {
                html: '<div>Every month</div>',
                text: 'Every month',
                attachments: fromJS([]),
            },
        },
        {
            deactivated_datetime: '2021-01-26T00:30:00Z',
            id: 'ded6b39b-a85c-487e-8658-3f380d238529',
            title: 'What is my size?',
            response_message_content: {
                html: '<div>The moon</div>',
                text: 'The moon',
                attachments: fromJS([]),
            },
        },
    ],
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
            deactivated_datetime: null,
            id: 'ded6b39b-a85c-487e-8658-3f380d238528',
            title: 'When do you usually restock?',
            response_message_content: {
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
                quick_response_policies: [
                    {
                        deactivated_datetime: '2021-01-26T00:30:00Z',
                        id: 'ded6b39b-a85c-487e-8658-3f380d238529',
                        title: 'What is my size?',
                        response_message_content: {
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
