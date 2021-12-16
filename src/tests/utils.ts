import axios from 'axios'

export const mockImageOnload = () => {
    let srcSet: PropertyDescriptor | undefined

    beforeEach(function () {
        srcSet = Object.getOwnPropertyDescriptor(global.Image.prototype, 'src')
        Object.defineProperty(global.Image.prototype, 'src', {
            set(value) {
                // eslint-disable-next-line no-restricted-properties
                axios
                    .get(value)
                    .then(() => (this as {onload: () => void}).onload())
                    .catch(() => (this as {onerror: () => void}).onerror())
            },
        })
    })

    afterEach(function () {
        Object.defineProperty(global.Image.prototype, 'src', srcSet!)
    })
}
