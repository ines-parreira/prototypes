import React, {ComponentProps, useContext} from 'react'
import {render} from '@testing-library/react'

import {assumeMock} from 'utils/testing'

import Template, {CustomizationContext} from 'Widgets/modules/Template'

import Magento2Widget, {customization} from '../Magento2'

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

describe('Magento2Widget', () => {
    beforeEach(() => {
        TemplateMock.mockReturnValue(<></>)
    })
    const props = {
        whatever: '20-1 rpz',
    } as unknown as ComponentProps<typeof Magento2Widget>

    it('should call the Template component with passed props', () => {
        render(<Magento2Widget {...props} />)

        expect(TemplateMock).toHaveBeenCalledWith(props, expect.anything())
    })

    it('should call the customization context provider with the customization object', () => {
        let passedCustomization = null
        TemplateMock.mockImplementation(() => {
            passedCustomization = useContext(CustomizationContext)
            return <></>
        })
        render(<Magento2Widget {...props} />)

        expect(passedCustomization).toEqual(customization)
    })
})
