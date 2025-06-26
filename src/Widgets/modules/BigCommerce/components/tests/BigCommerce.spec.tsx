import React, { ComponentProps, useContext } from 'react'

import { render } from '@testing-library/react'

import { assumeMock } from 'utils/testing'
import Template, { CustomizationContext } from 'Widgets/modules/Template'

import BigCommerceWidget, { customization } from '../BigCommerce'

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

describe('BigCommerceWidget', () => {
    beforeEach(() => {
        TemplateMock.mockReturnValue(<></>)
    })
    const props = {
        whatever: '20-1 rpz',
    } as unknown as ComponentProps<typeof BigCommerceWidget>

    it('should call the Template component with passed props', () => {
        render(<BigCommerceWidget {...props} />)

        expect(TemplateMock).toHaveBeenCalledWith(props, expect.anything())
    })

    it('should call the customization context provider with the customization object', () => {
        let passedCustomization = null
        TemplateMock.mockImplementation(() => {
            passedCustomization = useContext(CustomizationContext)
            return <></>
        })
        render(<BigCommerceWidget {...props} />)

        expect(passedCustomization).toEqual(customization)
    })
})

describe('card customization', () => {
    const cardCustomization = customization.card!
    it.each([
        ['integrations.420.customer', true],
        ['integrations.420.draft_orders.[]', true],
        ['integrations.420.orders.[]', true],
        ['integrations.420.orders.[].bc_order_shipments.[]', true],
        ['integrations.420.customer.smth', false],
        ['integrations.420.orders.[].smth', false],
        ['integrations.420.draft_orders.[].smth', false],
        ['integrations.420.orders.[].bc_order_shipments.[].smth', false],
    ])(
        'should have a dataMatcher that matches the given path, or not',
        (dataPath, output) => {
            const hasMatch = cardCustomization.some(({ dataMatcher }) => {
                return dataMatcher.test(dataPath)
            })
            expect(hasMatch).toBe(output)
        },
    )

    it('should have a templateMatcher that matches the given path, or not', () => {
        const hasMatch = cardCustomization.some(({ templateMatcher }) => {
            return templateMatcher?.test('1.template.widgets.2.widgets.3')
        })
        expect(hasMatch).toBe(true)

        const hasNoMatch = cardCustomization.some(({ templateMatcher }) => {
            return templateMatcher?.test('1.template.widgets.2.widgets.3.smth')
        })
        expect(hasNoMatch).toBe(false)
    })
})
