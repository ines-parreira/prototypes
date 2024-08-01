import React, {ComponentProps, useContext} from 'react'
import {render} from '@testing-library/react'

import {assumeMock} from 'utils/testing'
import {LeafTemplate} from 'models/widget/types'

import Template, {CustomizationContext} from 'Widgets/modules/Template'
import {FALLBACK_VALUE} from 'Widgets/modules/Template/modules/Field'

import {formatRechargeDateTime} from '../../helpers/formatRechargeDateTime'
import RechargeWidget, {customization} from '../Recharge'

jest.mock('Widgets/modules/Template', () => {
    const templateExports: Record<string, unknown> = jest.requireActual(
        'Widgets/modules/Template'
    )
    return {
        ...templateExports,
        default: jest.fn(),
    }
})
jest.mock('../../helpers/formatRechargeDateTime')
const TemplateMock = assumeMock(Template)
const formatRechargeDateTimeMock = assumeMock(formatRechargeDateTime)

describe('RechargeWidget', () => {
    beforeEach(() => {
        TemplateMock.mockReturnValue(<></>)
    })
    const props = {
        whatever: '20-1 rpz',
    } as unknown as ComponentProps<typeof RechargeWidget>

    it('should call the Template component with passed props', () => {
        render(<RechargeWidget {...props} />)

        expect(TemplateMock).toHaveBeenCalledWith(props, expect.anything())
    })

    it('should call the customization context provider with the customization object', () => {
        let passedCustomization = null
        TemplateMock.mockImplementation(() => {
            passedCustomization = useContext(CustomizationContext)
            return <></>
        })
        render(<RechargeWidget {...props} />)

        expect(passedCustomization).toEqual(customization)
    })
})

describe('field customization', () => {
    it('should call `formatRecharcheDataTime` with source when `getValue` is called', () => {
        formatRechargeDateTimeMock.mockReturnValue('ok')
        customization.field?.[0].getValue('source', {} as LeafTemplate)

        expect(formatRechargeDateTimeMock).toHaveBeenCalledWith('source')
    })

    it('should return FALLBACK_VALUE if source is not a string when calling `getValue`', () => {
        expect(
            customization.field?.[0].getValue({}, {} as LeafTemplate)
        ).toEqual(FALLBACK_VALUE)
    })

    it('should return null when getValueString is called with a non-string source', () => {
        expect(
            customization.field?.[0].getValueString({}, {} as LeafTemplate)
        ).toBeNull()
    })

    it('should call `formatRechargeDateTime` with source when `getValueString` is called', () => {
        formatRechargeDateTimeMock.mockReturnValue('ok')
        customization.field?.[0].getValueString('source', {} as LeafTemplate)

        expect(formatRechargeDateTimeMock).toHaveBeenCalledWith('source')
    })
})
