import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import React from 'react'

import {Provider} from 'react-redux'

import configureMockStore from 'redux-mock-store'

import {useFlag} from 'common/flags'
import {Integration, ShopifyIntegration} from 'models/integration/types'
import {assumeMock} from 'utils/testing'

import {useIsOverviewPageEnabled} from '../useIsOverviewPageEnabled'

const mockStore = configureMockStore()

jest.mock('common/flags')
const useFlagSpy = assumeMock(useFlag)

const renderUseIsOverviewPageEnabledWithIntegrations = (
    integrations: Integration[]
) =>
    renderHook(() => useIsOverviewPageEnabled(), {
        wrapper: ({children}) => (
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations,
                    }),
                })}
            >
                {children}
            </Provider>
        ),
    })

describe('useIsOverviewPageEnabled', () => {
    const SHOPIFY_INTEGRATION = {
        type: 'shopify',
    } as ShopifyIntegration
    const NON_SHOPIFY_INTEGRATION = {
        type: 'email',
    } as Exclude<Integration, ShopifyIntegration>

    describe('when feature flag is enabled', () => {
        beforeEach(() => {
            useFlagSpy.mockReturnValue(true)
        })

        describe('when has shopify integration', () => {
            it('should return true', () => {
                const {result} = renderUseIsOverviewPageEnabledWithIntegrations(
                    [SHOPIFY_INTEGRATION]
                )
                expect(result.current).toBe(true)
            })
        })

        describe("when doesn't have shopify integration", () => {
            it('should return false', () => {
                const {result} = renderUseIsOverviewPageEnabledWithIntegrations(
                    [NON_SHOPIFY_INTEGRATION]
                )
                expect(result.current).toBe(false)
            })
        })
    })

    describe('when feature flag is disabled', () => {
        beforeEach(() => {
            useFlagSpy.mockReturnValue(false)
        })

        describe('when has shopify integration', () => {
            it('should return false', () => {
                const {result} = renderUseIsOverviewPageEnabledWithIntegrations(
                    [SHOPIFY_INTEGRATION]
                )
                expect(result.current).toBe(false)
            })
        })

        describe("when doesn't have shopify integration", () => {
            it('should return false', () => {
                const {result} = renderUseIsOverviewPageEnabledWithIntegrations(
                    [NON_SHOPIFY_INTEGRATION]
                )
                expect(result.current).toBe(false)
            })
        })
    })
})
