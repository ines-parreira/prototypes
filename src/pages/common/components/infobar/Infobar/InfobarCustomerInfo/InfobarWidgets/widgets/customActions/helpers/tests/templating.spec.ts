import { TemplateContext } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import {
    applyCustomActionTemplate,
    applyCustomActionVariables,
    TemplateValues,
} from '../templating'

describe('applyCustomActionTemplate', () => {
    it('should output the correct templated string', () => {
        const template =
            'something {{ticket.subject}} templated $integrationId {{expect_me}}'
        const templateContext = {
            variables: {
                integrationId: '1337',
            },
            context: {
                ticket: {
                    subject: 'super duper',
                },
            },
        } as TemplateContext

        expect(applyCustomActionTemplate(template, templateContext)).toBe(
            'something super duper templated 1337 ',
        )
        expect(applyCustomActionTemplate(template, templateContext, true)).toBe(
            'something super duper templated 1337 {{expect_me}}',
        )
    })
})

describe('applyCustomActionVariables', () => {
    it('should output the correct templated string', () => {
        const listIndexValue = '1'
        const integrationIdValue = '1337'
        const templateValues: TemplateValues = {
            listIndex: listIndexValue,
            integrationId: integrationIdValue,
        }

        expect(
            applyCustomActionVariables(
                'something $listIndex templated $integrationId',
                templateValues,
            ),
        ).toEqual(`something ${listIndexValue} templated ${integrationIdValue}`)
    })
})
