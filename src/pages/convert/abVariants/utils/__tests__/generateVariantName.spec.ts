import {generateVariantName} from '../generateVariantName'

describe('generateVariantName', () => {
    it('generates variant name', () => {
        expect(generateVariantName(0)).toEqual('Variant A')
        expect(generateVariantName(1)).toEqual('Variant B')
    })
})
