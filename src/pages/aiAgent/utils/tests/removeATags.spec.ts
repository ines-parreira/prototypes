import { removeATags } from 'pages/aiAgent/utils/removeATags'

describe('removeATags', () => {
    it('should return a tags', () => {
        const input =
            'Our top pick is the <strong>Ultra Hydration Cream</strong>. It’s packed with natural ingredients to combat dryness. Check it out here: <a href="https://example.com/moisturizer" target="_blank">View Product</a>.'
        const result = removeATags(input)
        expect(result).toEqual(
            'Our top pick is the <strong>Ultra Hydration Cream</strong>. It’s packed with natural ingredients to combat dryness. Check it out here: View Product.',
        )
    })

    it('should return input string if no a tag', () => {
        const input =
            'Our top pick is the <strong>Ultra Hydration Cream</strong>. It’s packed with natural ingredients to combat dryness. Check it out here: View Product.'
        const result = removeATags(input)
        expect(result).toEqual(input)
    })
})
