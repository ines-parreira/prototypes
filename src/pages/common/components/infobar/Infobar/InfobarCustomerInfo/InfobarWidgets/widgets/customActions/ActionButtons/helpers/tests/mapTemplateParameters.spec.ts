import {
    Parameter,
    TemplateContext,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import {applyCustomActionTemplate} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/helpers/templating'
import {assumeMock} from 'utils/testing'

import {mapTemplateParameters} from '../mapTemplateParameters'

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/helpers/templating'
)
const applyCustomActionTemplateMock = assumeMock(applyCustomActionTemplate)

describe('mapTemplateParameters', () => {
    beforeEach(() => {
        applyCustomActionTemplateMock.mockReturnValue('ok')
    })
    it('should call applyCustomActionTemplate with correct props', () => {
        const parameters = [
            {
                key: 'key $listIndex',
                value: 'value $listIndex',
                label: 'label $listIndex',
            },
        ] as Parameter[]
        const templateContext = {
            variables: {
                listIndex: 'foo',
            },
        } as TemplateContext
        const result = mapTemplateParameters(parameters, templateContext, true)
        expect(result).toEqual([
            {
                key: 'ok',
                value: 'ok',
                label: 'ok',
            },
        ])
        expect(applyCustomActionTemplateMock.mock.calls.length).toBe(3)
        ;['key', 'value', 'label'].forEach((key, index) => {
            expect(applyCustomActionTemplateMock.mock.calls[index]).toEqual([
                parameters[0][key as keyof Parameter],
                templateContext,
                true,
            ])
        })

        applyCustomActionTemplateMock.mockClear()
        mapTemplateParameters(parameters, templateContext)
        ;['key', 'value', 'label'].forEach((key, index) => {
            expect(applyCustomActionTemplateMock.mock.calls[index]).toEqual([
                parameters[0][key as keyof Parameter],
                templateContext,
            ])
        })
    })
})
