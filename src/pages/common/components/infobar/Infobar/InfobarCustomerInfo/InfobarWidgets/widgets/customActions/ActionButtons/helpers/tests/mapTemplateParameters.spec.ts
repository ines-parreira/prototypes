import {
    Parameter,
    TemplateContext,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import {mapTemplateParameters} from '../mapTemplateParameters'

describe('mapTemplateParameters', () => {
    it('should return the expected structure with templated values', () => {
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
        const result = mapTemplateParameters(parameters, templateContext)
        expect(result).toEqual([
            {
                key: 'key foo',
                value: 'value foo',
                label: 'label foo',
            },
        ])
    })
})
