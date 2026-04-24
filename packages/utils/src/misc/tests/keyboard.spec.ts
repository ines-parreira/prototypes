describe('keyboard utils', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
        vi.resetModules()
    })

    describe('isSubmitShortcut', () => {
        describe('on macOS', () => {
            async function importOnMac() {
                vi.stubGlobal('navigator', { platform: 'MacIntel' })
                const { isSubmitShortcut } = await import('../keyboard')
                return isSubmitShortcut
            }

            it('should return true for Cmd+Enter', async () => {
                const isSubmitShortcut = await importOnMac()

                expect(
                    isSubmitShortcut({
                        key: 'Enter',
                        metaKey: true,
                        ctrlKey: false,
                    }),
                ).toBe(true)
            })

            it('should return false for Ctrl+Enter', async () => {
                const isSubmitShortcut = await importOnMac()

                expect(
                    isSubmitShortcut({
                        key: 'Enter',
                        metaKey: false,
                        ctrlKey: true,
                    }),
                ).toBe(false)
            })

            it('should return false for Enter without modifier', async () => {
                const isSubmitShortcut = await importOnMac()

                expect(
                    isSubmitShortcut({
                        key: 'Enter',
                        metaKey: false,
                        ctrlKey: false,
                    }),
                ).toBe(false)
            })

            it('should return false for Cmd with a different key', async () => {
                const isSubmitShortcut = await importOnMac()

                expect(
                    isSubmitShortcut({
                        key: 'Space',
                        metaKey: true,
                        ctrlKey: false,
                    }),
                ).toBe(false)
            })
        })

        describe('on non-macOS', () => {
            async function importOnWindows() {
                vi.stubGlobal('navigator', { platform: 'Win32' })
                const { isSubmitShortcut } = await import('../keyboard')
                return isSubmitShortcut
            }

            it('should return true for Ctrl+Enter', async () => {
                const isSubmitShortcut = await importOnWindows()

                expect(
                    isSubmitShortcut({
                        key: 'Enter',
                        metaKey: false,
                        ctrlKey: true,
                    }),
                ).toBe(true)
            })

            it('should return false for Cmd+Enter', async () => {
                const isSubmitShortcut = await importOnWindows()

                expect(
                    isSubmitShortcut({
                        key: 'Enter',
                        metaKey: true,
                        ctrlKey: false,
                    }),
                ).toBe(false)
            })

            it('should return false for Enter without modifier', async () => {
                const isSubmitShortcut = await importOnWindows()

                expect(
                    isSubmitShortcut({
                        key: 'Enter',
                        metaKey: false,
                        ctrlKey: false,
                    }),
                ).toBe(false)
            })
        })
    })
})
