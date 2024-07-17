import {IntegrationType} from '@gorgias/api-types'
import {Template} from 'models/widget/types'
import magento2 from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/magento2'
import {assumeMock} from 'utils/testing'

import {getExtensions, seekCardCustomization} from '../extensions'
import {TemplateCustomization} from '../../types'

const editionHiddenFields = ['bar']

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/magento2'
)
const mockMagento2 = assumeMock(magento2)
mockMagento2.mockImplementation(() => ({
    AfterTitle: () => 'ok',
    editionHiddenFields,
}))

describe('getExtensions', () => {
    it('should return the extensions', () => {
        const result = getExtensions(IntegrationType.Magento2, {
            type: 'card',
        } as Template)
        expect(result).toEqual({
            AfterTitle: expect.any(Function),
            editionHiddenFields,
        })
    })
})

describe('seekCardCustomization', () => {
    const cardCustomization = [
        {
            dataMatcher: /bar/,
            templateMatcher: /bar/,
            customization: {
                editionHiddenFields: ['title'],
            },
        },
        {
            dataMatcher: /foo/,
            templateMatcher: /bar/,
            customization: {
                editionHiddenFields: ['color'],
            },
        },
        {
            dataMatcher: /bar/,
            customization: {
                editionHiddenFields: ['title'],
            },
        },
        {
            dataMatcher: /bar/,
            customization: {
                editionHiddenFields: ['pictureUrl'],
            },
        },
    ] as TemplateCustomization['card']

    it("should return the first matched customization if the absolutePath matches the dataMatcher's regex", () => {
        const result = seekCardCustomization(cardCustomization, {
            absolutePath: ['bar'],
        } as Template)

        expect(result).toEqual({
            editionHiddenFields: ['title'],
        })
    })

    it("should return the matched customization if the absolutePath matches the dataMatcher's regex and the templatePath matches the templateMatcher's regex", () => {
        const result = seekCardCustomization(cardCustomization, {
            absolutePath: ['foo'],
            templatePath: 'bar',
        } as Template)

        expect(result).toEqual({
            editionHiddenFields: ['color'],
        })
    })
})
