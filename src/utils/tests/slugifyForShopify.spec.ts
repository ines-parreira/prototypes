import { slugify } from '../slugifyForShopify'

describe('slugify', () => {
    it('should replace spaces with hyphens', () => {
        expect(slugify('hello world')).toEqual('hello-world')
    })
    // remove consecutive hyphens
    it('should remove consecutive hyphens', () => {
        expect(slugify('hello--world')).toEqual('hello-world')
    })
    // remove non-alphanumeric characters
    it('should remove non-alphanumeric characters', () => {
        expect(slugify('hello!world')).toEqual('hello-world')
    })
    // convert to lowercase
    it('should convert to lowercase', () => {
        expect(slugify('HELLO WORLD')).toEqual('hello-world')
    })
    // remove leading and trailing hyphens
    it('should remove leading and trailing hyphens', () => {
        expect(slugify('-hello-world-')).toEqual('hello-world')
    })
})
