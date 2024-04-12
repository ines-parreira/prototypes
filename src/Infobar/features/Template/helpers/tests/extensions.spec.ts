import {IntegrationType} from 'models/integration/constants'
import {Template} from 'models/widget/types'
import shopify from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify'
import {assumeMock} from 'utils/testing'

import {getExtensions} from '../extensions'

const editionHiddenFields = ['bar']

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify'
)
const mockShopify = assumeMock(shopify)
mockShopify.mockImplementation(() => ({
    AfterTitle: () => 'ok',
    editionHiddenFields,
}))

describe('getExtensions', () => {
    it('should return the extensions', () => {
        const result = getExtensions(IntegrationType.Shopify, {
            type: 'card',
        } as Template)
        expect(result).toEqual({
            AfterTitle: expect.any(Function),
            editionHiddenFields,
        })
    })
})
