import {render} from '@testing-library/react'
import React, {ComponentProps, useContext} from 'react'

import {assumeMock} from 'utils/testing'

import Template, {CustomizationContext} from 'Widgets/modules/Template'

import WooCommerceWidget, {customization} from '../WooCommerce'

jest.mock('Widgets/modules/Template', () => {
    const templateExports: Record<string, unknown> = jest.requireActual(
        'Widgets/modules/Template'
    )
    return {
        ...templateExports,
        default: jest.fn(),
    }
})
const TemplateMock = assumeMock(Template)

describe('WooCommerceWidget', () => {
    beforeEach(() => {
        TemplateMock.mockReturnValue(<></>)
    })
    const props = {
        whatever: '20-1 rpz',
    } as unknown as ComponentProps<typeof WooCommerceWidget>

    it('should call the Template component with passed props', () => {
        render(<WooCommerceWidget {...props} />)

        expect(TemplateMock).toHaveBeenCalledWith(props, expect.anything())
    })

    it('should call the customization context provider with the customization object', () => {
        let passedCustomization = null
        TemplateMock.mockImplementation(() => {
            passedCustomization = useContext(CustomizationContext)
            return <></>
        })
        render(<WooCommerceWidget {...props} />)

        expect(passedCustomization).toEqual(customization)
    })
})

describe('card customization', () => {
    const cardCustomization = customization.card!
    it.each([
        ['ecommerce_data.anyId.shopper', true],
        ['ecommerce_data.anyId.orders.[]', true],
        ['ecommerce_data.anyId.shopper.smth', false],
        ['ecommerce_data.anyId.orders.[].smth', false],
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
