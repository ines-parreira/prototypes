import React, {ComponentProps, useContext} from 'react'
import {render} from '@testing-library/react'

import {assumeMock} from 'utils/testing'

import Template, {CustomizationContext} from 'Widgets/modules/Template'

import {ShopifyContext} from '../../contexts/ShopifyContext'
import {useShopifyContextData} from '../../hooks/useShopifyContextData'
import ShopifyWidget, {customization} from '../Shopify'

jest.mock('Widgets/modules/Template', () => {
    const templateExports: Record<string, unknown> = jest.requireActual(
        'Widgets/modules/Template'
    )
    return {
        ...templateExports,
        default: jest.fn(),
    }
})
jest.mock('../../hooks/useShopifyContextData')

const TemplateMock = assumeMock(Template)
const useShopifyContextDataMock = assumeMock(useShopifyContextData)

describe('ShopifyWidget', () => {
    beforeEach(() => {
        TemplateMock.mockReturnValue(<></>)
    })
    const props = {
        whatever: '20-1 rpz',
    } as unknown as ComponentProps<typeof ShopifyWidget>

    it('should call the Template component with passed props', () => {
        render(<ShopifyWidget {...props} />)

        expect(TemplateMock).toHaveBeenCalledWith(props, expect.anything())
    })

    it('should call the customization context provider with the customization object', () => {
        let passedCustomization = null
        TemplateMock.mockImplementation(() => {
            passedCustomization = useContext(CustomizationContext)
            return <></>
        })
        render(<ShopifyWidget {...props} />)

        expect(passedCustomization).toEqual(customization)
    })
})

describe('ShopifyContext', () => {
    const spiedDataFunction = jest.fn()
    it('should provide a context', () => {
        const contextValue = {
            data_source: 'Order',
            widget_resource_ids: {
                target_id: 4,
                customer_id: null,
            },
        }
        useShopifyContextDataMock.mockReturnValue(contextValue)
        TemplateMock.mockImplementation(() => {
            const data = useContext(ShopifyContext)
            spiedDataFunction(data)
            return <></>
        })
        render(<ShopifyWidget template={null} source={{}} />)

        expect(spiedDataFunction).toHaveBeenCalledWith(contextValue)
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
            const hasMatch = cardCustomization.some(({dataMatcher}) => {
                return dataMatcher.test(dataPath)
            })
            expect(hasMatch).toBe(output)
        }
    )
})
