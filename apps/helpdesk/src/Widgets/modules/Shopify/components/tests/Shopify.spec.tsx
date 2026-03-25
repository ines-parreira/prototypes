import type { ComponentProps } from 'react'
import React, { useContext } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import Template, { CustomizationContext } from 'Widgets/modules/Template'

import ShopifyWidget, { customization } from '../Shopify'

jest.mock('Widgets/modules/Template', () => {
    const templateExports: Record<string, unknown> = jest.requireActual(
        'Widgets/modules/Template',
    )
    return {
        __esModule: true,
        ...templateExports,
        default: jest.fn(),
    }
})

const TemplateMock = assumeMock(Template)
const useFlagMock = assumeMock(useFlag)

describe('ShopifyWidget', () => {
    beforeEach(() => {
        TemplateMock.mockReturnValue(<></>)
        useFlagMock.mockReturnValue(false)
    })
    const props = {
        whatever: '20-1 rpz',
    } as unknown as ComponentProps<typeof ShopifyWidget>

    it('should call the Template component with passed props', () => {
        render(<ShopifyWidget {...props} />)

        expect(TemplateMock).toHaveBeenCalledWith(props, expect.anything())
    })

    it('should call the customization context provider with the customization object and the flag state', () => {
        let passedCustomization = null
        TemplateMock.mockImplementation(() => {
            passedCustomization = useContext(CustomizationContext)
            return <></>
        })
        render(<ShopifyWidget {...props} />)

        expect(useFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.ShopifyHideActionButtons,
        )
        expect(passedCustomization).toEqual({
            ...customization,
            hideActionsForCustomer: false,
        })
    })
})

describe('card customization', () => {
    const cardCustomization = customization.card!
    it.each([
        ['integrations.420.orders.[]', true],
        ['integrations.420.orders.[].line_items.[]', true],
        ['integrations.420.orders.[].fulfillments.[]', true],
        ['integrations.420.orders.[].shipping_address', true],
        ['integrations.420.draft_orders.[]', true],
        ['integrations.420.customer', true],
        ['integrations.420.customer.tags', false],
        ['integrations.420.orders.[].tags', false],
        ['integrations.420.customer.smth', false],
        ['integrations.420.orders', false],
        ['integrations.420.orders.[].smth', false],
    ])(
        'should have a dataMatcher that matches the given path, or not',
        (dataPath, output) => {
            const hasMatch = cardCustomization.some(({ dataMatcher }) => {
                return dataMatcher.test(dataPath)
            })
            expect(hasMatch).toBe(output)
        },
    )
})
