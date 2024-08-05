import React, {ComponentProps, useContext} from 'react'
import {render} from '@testing-library/react'

import {assumeMock} from 'utils/testing'

import Template, {CustomizationContext} from 'Widgets/modules/Template'

import SmileWidget, {customization} from '../Smile'

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
