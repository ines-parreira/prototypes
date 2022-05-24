import {renderCustomActionsTemplate, TemplateValues} from '../templating'

describe('renderCustomActionsTemplate', () => {
    it('should output the correct templated string', () => {
        const listIndexValue = '1'
        const integrationIdValue = '1337'
        const templateValues: TemplateValues = {
            listIndex: listIndexValue,
            integrationId: integrationIdValue,
        }

        expect(
            renderCustomActionsTemplate(
                'something $listIndex templated $integrationId',
                templateValues
            )
        ).toEqual(`something ${listIndexValue} templated ${integrationIdValue}`)
    })
})
