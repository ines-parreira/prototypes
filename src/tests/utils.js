import axios from 'axios'

export const mockImageOnload = () => {
    let srcSet

    beforeEach(function () {
        srcSet = Object.getOwnPropertyDescriptor(global.Image.prototype, 'src')
        Object.defineProperty(global.Image.prototype, 'src', {
            set(value) {
                // eslint-disable-next-line no-restricted-properties
                axios
                    .get(value)
                    .then(() => this.onload())
                    .catch(() => this.onerror())
            },
        })
    })

    afterEach(function () {
        Object.defineProperty(global.Image.prototype, 'src', srcSet)
    })
}
