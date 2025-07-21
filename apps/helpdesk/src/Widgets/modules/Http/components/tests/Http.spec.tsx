import React, { ComponentProps, useContext } from 'react'

import { render } from '@testing-library/react'

import { assumeMock } from 'utils/testing'
import Template, { CustomizationContext } from 'Widgets/modules/Template'

import HttpWidget, { customization } from '../Http'

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

describe('HttpWidget', () => {
    beforeEach(() => {
        TemplateMock.mockReturnValue(<></>)
    })
    const props = {
        whatever: '20-1 rpz',
    } as unknown as ComponentProps<typeof HttpWidget>

    it('should call the Template component with passed props', () => {
        render(<HttpWidget {...props} />)

        expect(TemplateMock).toHaveBeenCalledWith(props, expect.anything())
    })

    it('should call the customization context provider with the customization object', () => {
        let passedCustomization = null
        TemplateMock.mockImplementation(() => {
            passedCustomization = useContext(CustomizationContext)
            return <></>
        })
        render(<HttpWidget {...props} />)

        expect(passedCustomization).toEqual(customization)
    })

    describe('card customization', () => {
        const cardCustomization = customization.card!
        it.each([
            ['ticket.customer.integrations.10', true],
            ['ticket.customer.integrations.10.data', true],
            ['ticket.customer.integrations.10.[data]', true],
            ['ticket.customer.integrations.10.data.[meuuuuh]', false],
            ['ticket.customer.integrations.10.data.else', false],
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
})
