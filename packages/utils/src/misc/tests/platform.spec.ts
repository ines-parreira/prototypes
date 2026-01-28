describe('platform utils', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
        vi.resetModules()
    })

    describe('platform', () => {
        it('should use userAgentData.platform when available', async () => {
            const mockNavigator = {
                userAgentData: {
                    platform: 'macOS',
                },
                platform: 'MacIntel',
            }
            vi.stubGlobal('navigator', mockNavigator)

            const { platform } = await import('../platform')

            expect(platform).toBe('macOS')
        })

        it('should fall back to navigator.platform when userAgentData is not available', async () => {
            const mockNavigator = {
                platform: 'Win32',
            }
            vi.stubGlobal('navigator', mockNavigator)

            const { platform } = await import('../platform')

            expect(platform).toBe('Win32')
        })

        it('should return "unknown" when neither userAgentData nor platform are available', async () => {
            const mockNavigator = {}
            vi.stubGlobal('navigator', mockNavigator)

            const { platform } = await import('../platform')

            expect(platform).toBe('unknown')
        })
    })

    describe('isMacOs', () => {
        it('should return true for macOS platform', async () => {
            const mockNavigator = {
                platform: 'MacIntel',
            }
            vi.stubGlobal('navigator', mockNavigator)

            const { isMacOs } = await import('../platform')

            expect(isMacOs).toBe(true)
        })

        it('should return true for mac platform (lowercase)', async () => {
            const mockNavigator = {
                platform: 'mac',
            }
            vi.stubGlobal('navigator', mockNavigator)

            const { isMacOs } = await import('../platform')

            expect(isMacOs).toBe(true)
        })

        it('should return false for Windows platform', async () => {
            const mockNavigator = {
                platform: 'Win32',
            }
            vi.stubGlobal('navigator', mockNavigator)

            const { isMacOs } = await import('../platform')

            expect(isMacOs).toBe(false)
        })
    })
})
