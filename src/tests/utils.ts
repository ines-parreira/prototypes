export const createImageFetchMock = () => {
    const srcSet = Object.getOwnPropertyDescriptor(
        global.Image.prototype,
        'src',
    )
    return {
        mock: (load: () => Promise<unknown>) => {
            Object.defineProperty(global.Image.prototype, 'src', {
                set() {
                    load()
                        .then(() => {
                            ;(this as { onload: () => void }).onload()
                        })
                        .catch(() => {
                            ;(this as { onerror: () => void }).onerror()
                        })
                },
            })
        },
        resetMock: () => {
            Object.defineProperty(global.Image.prototype, 'src', srcSet!)
        },
    }
}
