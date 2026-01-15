import { mutateSizes } from '../mutateSizes'

const defaultConfigs = {
    panel1: {
        defaultSize: 200,
        minSize: 100,
        maxSize: 300,
    },
    panel2: {
        defaultSize: 200,
        minSize: 100,
        maxSize: 300,
    },
    panel3: {
        defaultSize: 200,
        minSize: 100,
        maxSize: 300,
    },
    panel4: {
        defaultSize: 200,
        minSize: 100,
        maxSize: 300,
    },
}
const defaultOrder = ['panel1', 'panel2', 'panel3', 'panel4']
const defaultSizes = { panel1: 200, panel2: 200, panel3: 200, panel4: 200 }

describe('mutateSizes', () => {
    it('should return the given sizes if the delta is 0', () => {
        const drag = {
            handle: 0,
            position: { x: 0, y: 0 },
            sizes: defaultSizes,
        }
        const result = mutateSizes(defaultConfigs, defaultOrder, drag, 0)
        expect(result).toBe(defaultSizes)
    })

    it('should resize the panels closest to the panel if there is room when dragging left', () => {
        const drag = {
            handle: 2,
            position: { x: 0, y: 0 },
            sizes: defaultSizes,
        }
        const result = mutateSizes(defaultConfigs, defaultOrder, drag, -50)
        expect(result).toEqual({
            panel1: 200,
            panel2: 150,
            panel3: 250,
            panel4: 200,
        })
    })

    it('should resize further panels if the closest panels can no longer be resized when dragging left', () => {
        const drag = {
            handle: 2,
            position: { x: 0, y: 0 },
            sizes: defaultSizes,
        }
        const result = mutateSizes(defaultConfigs, defaultOrder, drag, -150)
        expect(result).toEqual({
            panel1: 150,
            panel2: 100,
            panel3: 300,
            panel4: 250,
        })
    })

    it('should resize the panels closest to the panel if there is room when dragging right', () => {
        const drag = {
            handle: 2,
            position: { x: 0, y: 0 },
            sizes: defaultSizes,
        }
        const result = mutateSizes(defaultConfigs, defaultOrder, drag, 50)
        expect(result).toEqual({
            panel1: 200,
            panel2: 250,
            panel3: 150,
            panel4: 200,
        })
    })

    it('should resize further panels if the closest panels can no longer be resized when dragging right', () => {
        const drag = {
            handle: 2,
            position: { x: 0, y: 0 },
            sizes: defaultSizes,
        }
        const result = mutateSizes(defaultConfigs, defaultOrder, drag, 150)
        expect(result).toEqual({
            panel1: 250,
            panel2: 300,
            panel3: 100,
            panel4: 150,
        })
    })
})
