import mutatePanels from '../mutatePanels'

describe('mutatePanels', () => {
    it('should mutate when two panels when dragging to the left', () => {
        const result = mutatePanels({
            config: [[Infinity], [Infinity]],
            currentWidths: [400, 400],
            delta: -20,
            handle: 0,
            totalWidth: 800,
        })

        expect(result).toEqual([380, 420])
    })

    it('should mutate when two panels when dragging to the right', () => {
        const result = mutatePanels({
            config: [[Infinity], [Infinity]],
            currentWidths: [400, 400],
            delta: 20,
            handle: 0,
            totalWidth: 800,
        })

        expect(result).toEqual([420, 380])
    })

    it('should respect minimum widths when dragging to the left', () => {
        const result = mutatePanels({
            config: [[Infinity, 350], [Infinity]],
            currentWidths: [400, 400],
            delta: -100,
            handle: 0,
            totalWidth: 800,
        })

        expect(result).toEqual([350, 450])
    })

    it('should respect minimum widths when dragging to the right', () => {
        const result = mutatePanels({
            config: [[Infinity], [Infinity, 350]],
            currentWidths: [400, 400],
            delta: 100,
            handle: 0,
            totalWidth: 800,
        })

        expect(result).toEqual([450, 350])
    })

    it('should respect maximum widths when dragging to the left', () => {
        const result = mutatePanels({
            config: [[Infinity], [Infinity, 0, 500]],
            currentWidths: [400, 400],
            delta: -150,
            handle: 0,
            totalWidth: 800,
        })

        expect(result).toEqual([300, 500])
    })

    it('should respect maximum widths when dragging to the right', () => {
        const result = mutatePanels({
            config: [[Infinity, 0, 500], [Infinity]],
            currentWidths: [400, 400],
            delta: 150,
            handle: 0,
            totalWidth: 800,
        })

        expect(result).toEqual([500, 300])
    })

    it('should resize the next panel over if the closest panel cannot resize when dragging left', () => {
        const result = mutatePanels({
            config: [[250, 150, 350], [250, 250, 500], [300]],
            currentWidths: [250, 250, 300],
            delta: -150,
            handle: 1,
            totalWidth: 800,
        })

        expect(result).toEqual([150, 250, 400])
    })

    it('should resize the next panel over if the closest panel cannot resize when dragging right', () => {
        const result = mutatePanels({
            config: [[300], [250, 250, 500], [250, 150, 350]],
            currentWidths: [300, 250, 250],
            delta: 150,
            handle: 0,
            totalWidth: 800,
        })

        expect(result).toEqual([400, 250, 150])
    })
})
