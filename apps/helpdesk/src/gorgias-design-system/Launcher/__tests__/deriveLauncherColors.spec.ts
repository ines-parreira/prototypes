import { deriveLauncherColors } from '../deriveLauncherColors'

describe('deriveLauncherColors', () => {
    describe('bucket classification', () => {
        it('should classify #000000 as achromatic', () => {
            expect(deriveLauncherColors('#000000').bucket).toBe('achromatic')
        })

        it('should classify #FFFFFF as achromatic', () => {
            expect(deriveLauncherColors('#FFFFFF').bucket).toBe('achromatic')
        })

        it('should classify #808080 as achromatic', () => {
            expect(deriveLauncherColors('#808080').bucket).toBe('achromatic')
        })

        it('should classify #1B4E40 as darkChromatic', () => {
            expect(deriveLauncherColors('#1B4E40').bucket).toBe('darkChromatic')
        })

        it('should classify #3B82F6 as midChromatic', () => {
            expect(deriveLauncherColors('#3B82F6').bucket).toBe('midChromatic')
        })

        it('should classify #EF4444 as midChromatic', () => {
            expect(deriveLauncherColors('#EF4444').bucket).toBe('midChromatic')
        })

        it('should classify #A7F3D0 as lightChromatic', () => {
            expect(deriveLauncherColors('#A7F3D0').bucket).toBe(
                'lightChromatic',
            )
        })

        it('should classify #E9D5FF as lightChromatic', () => {
            expect(deriveLauncherColors('#E9D5FF').bucket).toBe(
                'lightChromatic',
            )
        })
    })

    describe('foreground colors per spec algorithm', () => {
        it('should derive colors for #000000 (achromatic)', () => {
            const result = deriveLauncherColors('#000000')

            expect(result.iconColor).toBe('#000000')
            expect(result.labelColor).toBe('#000000')
            expect(result.closeIconColor).toBe('#FFFFFF')
            expect(result.dotsColor).toBe('#FFFFFF')
        })

        it('should derive colors for #FFFFFF (achromatic)', () => {
            const result = deriveLauncherColors('#FFFFFF')

            expect(result.iconColor).toBe('#1C1C1C')
            expect(result.labelColor).toBe('#1C1C1C')
            expect(result.closeIconColor).toBe('#1C1C1C')
            expect(result.dotsColor).toBe('#FFFFFF')
        })

        it('should derive colors for #808080 (achromatic)', () => {
            const result = deriveLauncherColors('#808080')

            expect(result.iconColor).toBe('#808080')
            expect(result.labelColor).toBe('#1C1C1C')
            expect(result.closeIconColor).toBe('#1C1C1C')
            expect(result.dotsColor).toBe('#FFFFFF')
        })

        it('should derive colors for #1B4E40 (darkChromatic)', () => {
            const result = deriveLauncherColors('#1B4E40')

            expect(result.iconColor).toBe('#1b4e40')
            expect(result.labelColor).toBe('#1b4e40')
            expect(result.closeIconColor).toBe('#FFFFFF')
            expect(result.dotsColor).toBe('#FFFFFF')
        })

        it('should derive colors for #3B82F6 (midChromatic)', () => {
            const result = deriveLauncherColors('#3B82F6')

            expect(result.iconColor).toBe('#3b82f6')
            expect(result.labelColor).toBe('#1C1C1C')
            expect(result.closeIconColor).toBe('#1C1C1C')
            expect(result.dotsColor).toBe('#FFFFFF')
        })

        it('should derive colors for #EF4444 (midChromatic)', () => {
            const result = deriveLauncherColors('#EF4444')

            expect(result.iconColor).toBe('#ef4444')
            expect(result.labelColor).toBe('#1C1C1C')
            expect(result.closeIconColor).toBe('#1C1C1C')
            expect(result.dotsColor).toBe('#FFFFFF')
        })

        it('should derive colors for #A7F3D0 (lightChromatic)', () => {
            const result = deriveLauncherColors('#A7F3D0')

            expect(result.iconColor).toBe('#1C1C1C')
            expect(result.labelColor).toBe('#1C1C1C')
            expect(result.closeIconColor).toBe('#1C1C1C')
            expect(result.dotsColor).toBe('#FFFFFF')
        })

        it('should derive colors for #E9D5FF (lightChromatic)', () => {
            const result = deriveLauncherColors('#E9D5FF')

            expect(result.iconColor).toBe('#1C1C1C')
            expect(result.labelColor).toBe('#1C1C1C')
            expect(result.closeIconColor).toBe('#1C1C1C')
            expect(result.dotsColor).toBe('#FFFFFF')
        })
    })

    describe('glow stops', () => {
        it('should produce rgba glow stops for all buckets', () => {
            const colors = ['#000000', '#1B4E40', '#3B82F6', '#A7F3D0']
            for (const color of colors) {
                const result = deriveLauncherColors(color)
                expect(result.glowStop0).toContain('rgba')
                expect(result.glowStop50).toContain('rgba')
                expect(result.glowStop100).toContain('rgba')
            }
        })

        it('should use #DADADA as glow base for achromatic colors', () => {
            const result = deriveLauncherColors('#808080')
            expect(result.glowStop0).toContain('218')
        })

        it('should use brand directly as glow base for darkChromatic', () => {
            const result = deriveLauncherColors('#1B4E40')
            expect(result.glowStop0).toContain('rgba')
        })
    })

    describe('gradientScale for near-black', () => {
        it('should apply 0.9 scale for #000000', () => {
            const black = deriveLauncherColors('#000000')
            const gray = deriveLauncherColors('#808080')

            expect(black.glowStop50).toContain('0.405')
            expect(gray.glowStop50).toContain('0.45')
        })

        it('should apply 0.9 scale to glow stop100 for #000000', () => {
            const black = deriveLauncherColors('#000000')

            expect(black.glowStop100).toContain('0.765')
        })
    })

    describe('bloom color', () => {
        it('should use 0.35 opacity for bloom', () => {
            const result = deriveLauncherColors('#3B82F6')
            expect(result.bloomColor).toContain('0.35')
        })

        it('should use white highlight for achromatic colors', () => {
            const result = deriveLauncherColors('#808080')
            expect(result.bloomColor).toContain('255')
            expect(result.bloomColor).toContain('0.35')
        })
    })

    describe('badge colors', () => {
        it('should use brand as badge background when contrast is sufficient', () => {
            const result = deriveLauncherColors('#1B4E40')
            expect(result.badgeBackgroundColor).toBe('#1b4e40')
            expect(result.badgeFontColor).toBe('#FFFFFF')
        })

        it('should fall back to DARK/WHITE for badge when brand contrast is insufficient', () => {
            const result = deriveLauncherColors('#808080')
            expect(result.badgeBackgroundColor).toBe('#1C1C1C')
            expect(result.badgeFontColor).toBe('#FFFFFF')
        })
    })

    describe('input normalization', () => {
        it('should handle hex without # prefix', () => {
            const withHash = deriveLauncherColors('#1B4E40')
            const withoutHash = deriveLauncherColors('1B4E40')
            expect(withHash).toEqual(withoutHash)
        })

        it('should fall back to gray for an invalid color', () => {
            const result = deriveLauncherColors('not-a-color')
            expect(result.bucket).toBe('achromatic')
            expect(result.sheenStop0).toContain('rgba')
        })
    })

    describe('sheen stops', () => {
        it('should produce rgba sheen stops', () => {
            const result = deriveLauncherColors('#1B4E40')
            expect(result.sheenStop0).toContain('rgba')
            expect(result.sheenStop100).toContain('rgba')
        })

        it('should use full opacity for lightChromatic neutral', () => {
            const result = deriveLauncherColors('#A7F3D0')
            expect(result.sheenStop0).toContain(', 1)')
        })

        it('should use 0.6 opacity for non-lightChromatic neutral', () => {
            const result = deriveLauncherColors('#1B4E40')
            expect(result.sheenStop0).toContain('0.6')
        })
    })
})
