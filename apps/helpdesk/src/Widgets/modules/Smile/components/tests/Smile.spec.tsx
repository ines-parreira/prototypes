import { ComponentProps, useContext } from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import Template, { CustomizationContext } from 'Widgets/modules/Template'

import SmileWidget, { customization } from '../Smile'

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

describe('SmileWidget', () => {
    beforeEach(() => {
        TemplateMock.mockReturnValue(<></>)
    })
    const props = {
        whatever: '20-1 rpz',
    } as unknown as ComponentProps<typeof SmileWidget>

    it('should call the Template component with passed props', () => {
        render(<SmileWidget {...props} />)

        expect(TemplateMock).toHaveBeenCalledWith(props, expect.anything())
    })

    it('should call the customization context provider with the customization object', () => {
        let passedCustomization = null
        TemplateMock.mockImplementation(() => {
            passedCustomization = useContext(CustomizationContext)
            return <></>
        })
        render(<SmileWidget {...props} />)

        expect(passedCustomization).toEqual(customization)
    })
})

describe('card customization', () => {
    const cardCustomization = customization.card!
    it.each([
        ['integrations.420.customer', true],
        ['integrations.420.customer.smth', false],
        ['integrations.420.smth', false],
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
