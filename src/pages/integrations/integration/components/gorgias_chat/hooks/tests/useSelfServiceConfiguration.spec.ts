import {act, renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import {waitFor} from '@testing-library/react'
import {fetchSelfServiceConfiguration} from 'models/selfServiceConfiguration/resources'
import {ShopType} from 'models/selfServiceConfiguration/types'
import useSelfServiceConfiguration from '../useSelfServiceConfiguration'

const initialSelfServiceConfiguration = {
    id: 1,
    type: 'shopify' as ShopType,
    shop_name: 'test',
    created_datetime: '2021-01-01T00:00:00Z',
    updated_datetime: '2021-01-01T00:00:00Z',
    deactivated_datetime: null,
    article_recommendation_help_center_id: 1,
}

const integration = fromJS({meta: {shop_integration_id: 1}})

jest.mock('models/selfServiceConfiguration/resources', () => ({
    fetchSelfServiceConfiguration: jest.fn(),
}))

describe('useSelfServiceConfiguration', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    it('returns false when selfServiceConfiguration is null', () => {
        const {result} = renderHook(() =>
            useSelfServiceConfiguration(fromJS({}))
        )
        expect(result.current).toEqual({
            selfServiceConfigurationEnabled: false,
            selfServiceConfiguration: {},
        })
    })

    it('returns false when quickResponses, canTrackOrders, and canManageOrders are all false', async () => {
        const selfServiceConfiguration = {
            ...initialSelfServiceConfiguration,
            quick_response_policies: [],
            track_order_policy: {enabled: false},
            report_issue_policy: {enabled: false},
            cancel_order_policy: {enabled: false},
            return_order_policy: {enabled: false},
        }

        ;(
            fetchSelfServiceConfiguration as unknown as jest.Mock
        ).mockReturnValue(selfServiceConfiguration)

        const {result} = renderHook(() =>
            useSelfServiceConfiguration(integration)
        )

        await act(() =>
            waitFor(() =>
                expect(result.current).toEqual({
                    selfServiceConfigurationEnabled: false,
                    selfServiceConfiguration,
                })
            )
        )
    })

    it('returns true when quickResponses is not empty', async () => {
        const selfServiceConfiguration = {
            ...initialSelfServiceConfiguration,
            quick_response_policies: [{deactivated_datetime: null}],
            track_order_policy: {enabled: false},
            report_issue_policy: {enabled: false},
            cancel_order_policy: {enabled: false},
            return_order_policy: {enabled: false},
        }

        ;(
            fetchSelfServiceConfiguration as unknown as jest.Mock
        ).mockReturnValue(selfServiceConfiguration)

        const {result} = renderHook(() =>
            useSelfServiceConfiguration(integration)
        )

        await act(() =>
            waitFor(() =>
                expect(result.current).toEqual({
                    selfServiceConfigurationEnabled: true,
                    selfServiceConfiguration,
                })
            )
        )
    })

    it('returns true when canTrackOrders is true', async () => {
        const selfServiceConfiguration = {
            ...initialSelfServiceConfiguration,
            quick_response_policies: [],
            track_order_policy: {enabled: true},
            report_issue_policy: {enabled: false},
            cancel_order_policy: {enabled: false},
            return_order_policy: {enabled: false},
        }

        ;(
            fetchSelfServiceConfiguration as unknown as jest.Mock
        ).mockReturnValue(selfServiceConfiguration)

        const {result} = renderHook(() =>
            useSelfServiceConfiguration(integration)
        )

        await act(() =>
            waitFor(() =>
                expect(result.current).toEqual({
                    selfServiceConfigurationEnabled: true,
                    selfServiceConfiguration,
                })
            )
        )
    })

    it('returns true when canManageOrders is true', async () => {
        const selfServiceConfiguration = {
            ...initialSelfServiceConfiguration,
            quick_response_policies: [],
            track_order_policy: {enabled: false},
            report_issue_policy: {enabled: true},
            cancel_order_policy: {enabled: true},
            return_order_policy: {enabled: true},
        }

        ;(
            fetchSelfServiceConfiguration as unknown as jest.Mock
        ).mockReturnValue(selfServiceConfiguration)

        const {result} = renderHook(() =>
            useSelfServiceConfiguration(integration)
        )

        await act(() =>
            waitFor(() =>
                expect(result.current).toEqual({
                    selfServiceConfigurationEnabled: true,
                    selfServiceConfiguration,
                })
            )
        )
    })
})
