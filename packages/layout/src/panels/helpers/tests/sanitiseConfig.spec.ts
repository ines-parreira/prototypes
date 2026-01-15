import { sanitiseConfig } from '../sanitiseConfig'

describe('sanitiseConfig', () => {
    it('should convert fractional widths to pixel values', () => {
        const result = sanitiseConfig(
            { defaultSize: 0.3, minSize: 0.2, maxSize: 0.5 },
            1000,
        )
        expect(result).toEqual({ defaultSize: 300, minSize: 200, maxSize: 500 })
    })

    it('should set minSize to 0 if the config contains a value smaller than 0', () => {
        const result = sanitiseConfig(
            { defaultSize: 300, minSize: -100, maxSize: 500 },
            1000,
        )
        expect(result).toEqual({ defaultSize: 300, minSize: 0, maxSize: 500 })
    })

    it('should set maxSize to minSize if the config contains a value smaller than minSize', () => {
        const result = sanitiseConfig(
            { defaultSize: 300, minSize: 300, maxSize: 100 },
            1000,
        )
        expect(result).toEqual({ defaultSize: 300, minSize: 300, maxSize: 300 })
    })

    it('should not allow a defaultSize smaller than minSize', () => {
        const result = sanitiseConfig(
            { defaultSize: 200, minSize: 300, maxSize: 500 },
            1000,
        )
        expect(result).toEqual({ defaultSize: 300, minSize: 300, maxSize: 500 })
    })

    it('should not allow a defaultSize larger than maxSize', () => {
        const result = sanitiseConfig(
            { defaultSize: 600, minSize: 300, maxSize: 500 },
            1000,
        )
        expect(result).toEqual({ defaultSize: 500, minSize: 300, maxSize: 500 })
    })

    it('should return the original config if it is not dirty', () => {
        const config = { defaultSize: 400, minSize: 300, maxSize: 500 }
        const result = sanitiseConfig(config, 1000)
        expect(result).toBe(config)
    })
})
