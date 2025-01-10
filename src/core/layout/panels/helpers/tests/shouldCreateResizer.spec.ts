import shouldCreateResizer from '../shouldCreateResizer'

describe('shouldCreateResizer', () => {
    it('should return false for the first panel', () => {
        const result = shouldCreateResizer(0, {}, [])
        expect(result).toBe(false)
    })

    it('should return false if panels on the left cannot be resized', () => {
        const configs = {
            panel1: {defaultSize: 200, minSize: 200, maxSize: 200},
            panel2: {defaultSize: 200, minSize: 200, maxSize: 200},
            panel3: {defaultSize: 200, minSize: 200, maxSize: 200},
        }
        const order = ['panel1', 'panel2', 'panel3']
        const result = shouldCreateResizer(2, configs, order)
        expect(result).toBe(false)
    })

    it('should return true if panels on the left can be resized', () => {
        const configs = {
            panel1: {defaultSize: 200, minSize: 200, maxSize: 200},
            panel2: {defaultSize: 200, minSize: 100, maxSize: 200},
            panel3: {defaultSize: 200, minSize: 200, maxSize: 200},
        }
        const order = ['panel1', 'panel2', 'panel3']
        const result = shouldCreateResizer(2, configs, order)
        expect(result).toBe(true)
    })
})
