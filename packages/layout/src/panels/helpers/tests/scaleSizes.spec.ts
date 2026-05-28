import { scaleSizes } from '../scaleSizes'

describe('scaleSizes', () => {
    it('should scale panel sizes proportionally to the new available size', () => {
        const result = scaleSizes({
            availableSize: 2000,
            configs: {
                panel1: { defaultSize: 300, minSize: 100, maxSize: 900 },
                panel2: { defaultSize: 300, minSize: 100, maxSize: 900 },
                panel3: {
                    defaultSize: Infinity,
                    minSize: 100,
                    maxSize: Infinity,
                },
            },
            order: ['panel1', 'panel2', 'panel3'],
            snapshot: {
                availableSize: 1000,
                sizes: {
                    panel1: 300,
                    panel2: 300,
                    panel3: 400,
                },
            },
        })

        expect(result).toEqual({
            panel1: 600,
            panel2: 600,
            panel3: 800,
        })
    })

    it('should clamp scaled sizes and give the remaining size to growable panels', () => {
        const result = scaleSizes({
            availableSize: 1500,
            configs: {
                fixed: { defaultSize: 48, minSize: 48, maxSize: 48 },
                limited: { defaultSize: 238, minSize: 200, maxSize: 350 },
                content: {
                    defaultSize: Infinity,
                    minSize: 300,
                    maxSize: Infinity,
                },
            },
            order: ['fixed', 'limited', 'content'],
            snapshot: {
                availableSize: 1000,
                sizes: {
                    fixed: 48,
                    limited: 238,
                    content: 714,
                },
            },
        })

        expect(result).toEqual({
            fixed: 48,
            limited: 350,
            content: 1102,
        })
    })

    it('should give fixed-panel leftovers to panels configured with infinite max size before bounded side panels', () => {
        const result = scaleSizes({
            availableSize: 1500,
            configs: {
                fixed: { defaultSize: 48, minSize: 48, maxSize: 48 },
                infobar: { defaultSize: 340, minSize: 340, maxSize: 600 },
                content: {
                    defaultSize: Infinity,
                    minSize: 300,
                    maxSize: Infinity,
                },
            },
            order: ['fixed', 'infobar', 'content'],
            snapshot: {
                availableSize: 1000,
                sizes: {
                    fixed: 48,
                    infobar: 340,
                    content: 612,
                },
            },
        })

        expect(result.fixed).toBe(48)
        expect(result.infobar).toBeCloseTo(510)
        expect(result.content).toBeCloseTo(942)
    })
})
