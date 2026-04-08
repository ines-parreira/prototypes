import { slugify } from '../slugify'

describe('slugify', () => {
    it('should replace spaces with hyphens', () => {
        expect(slugify('hello world')).toEqual('hello-world')
    })

    it('should remove consecutive hyphens', () => {
        expect(slugify('hello--world')).toEqual('hello-world')
    })

    it('should remove non-alphanumeric characters', () => {
        expect(slugify('hello!world')).toEqual('hello-world')
    })

    it('should convert to lowercase', () => {
        expect(slugify('HELLO WORLD')).toEqual('hello-world')
    })

    it('should remove leading and trailing hyphens', () => {
        expect(slugify('-hello-world-')).toEqual('hello-world')
    })
})
