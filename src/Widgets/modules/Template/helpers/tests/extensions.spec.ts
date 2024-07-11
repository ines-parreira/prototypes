import {IntegrationType} from '@gorgias/api-types'
import {Template} from 'models/widget/types'
import bigcommerce from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce'
import {assumeMock} from 'utils/testing'

import {getExtensions, seekCardCustomization} from '../extensions'
import {TemplateCustomization} from '../../types'

const editionHiddenFields = ['bar']

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce'
)
const mockBigcommerce = assumeMock(bigcommerce)
mockBigcommerce.mockImplementation(() => ({
    AfterTitle: () => 'ok',
    editionHiddenFields,
}))

describe('getExtensions', () => {
    it('should return the extensions', () => {
        const result = getExtensions(IntegrationType.Bigcommerce, {
            type: 'card',
        } as Template)
        expect(result).toEqual({
            AfterTitle: expect.any(Function),
            editionHiddenFields,
        })
    })
})

describe('seekCardCustomization', () => {
    it("should return the first matched customization if the path matches the matcher's regex", () => {
        const card = [
            {
                matcher: /foo/,
                customization: {
                    editionHiddenFields: ['link'],
                },
            },
            {
                matcher: /bar/,
                customization: {
                    editionHiddenFields: ['title'],
                },
            },
            {
                matcher: /bar/,
                customization: {
                    editionHiddenFields: ['pictureUrl'],
                },
            },
        ] as TemplateCustomization['card']

        const result = seekCardCustomization(card, {
            absolutePath: ['bar'],
        } as Template)

        expect(result).toEqual({
            editionHiddenFields: ['title'],
        })
    })
})
