export const mockImageOnload = () => {
    let srcSet

    beforeEach(function () {
        srcSet = Object.getOwnPropertyDescriptor(global.Image.prototype, 'src')
        Object.defineProperty(global.Image.prototype, 'src', {
            set() {
                setTimeout(() => this.onload())
            },
        })
    })

    afterEach(function () {
        Object.defineProperty(global.Image.prototype, 'src', srcSet)
    })
}
