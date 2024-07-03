import {split_url} from '../utils'

describe('split_url', () => {
    it('should split url when there is https in url', () => {
        const base_url = 'test.com'
        const suffix = 'test_admin'
        const store_url = `https://${base_url}/${suffix}`

        const [result_base, result_suffix] = split_url(store_url)
        expect(result_base).toBe(base_url)
        expect(result_suffix).toBe(suffix)
    })
    it('should split url when there is no https in url', () => {
        const base_url = 'test.com'
        const suffix = 'test_admin'
        const store_url = `${base_url}/${suffix}`

        const [result_base, result_suffix] = split_url(store_url)
        expect(result_base).toBe(base_url)
        expect(result_suffix).toBe(suffix)
    })
    it('should split url when there are subpaths', () => {
        const base_url = 'test.com/path1/path2/path3'
        const suffix = 'test_admin'
        const store_url = `https://${base_url}/${suffix}`

        const [result_base, result_suffix] = split_url(store_url)
        expect(result_base).toBe(base_url)
        expect(result_suffix).toBe(suffix)
    })
    it('should split url when there are no subpaths', () => {
        const base_url = 'test.com'
        const suffix = 'test_admin'
        const store_url = `https://${base_url}/${suffix}`

        const [result_base, result_suffix] = split_url(store_url)
        expect(result_base).toBe(base_url)
        expect(result_suffix).toBe(suffix)
    })
    it('should split url when there is a query', () => {
        const base_url = 'test.com/path1/path2/path3'
        const suffix = 'test_admin'
        const store_url = `https://${base_url}/${suffix}?test=1&test=2`

        const [result_base, result_suffix] = split_url(store_url)
        expect(result_base).toBe(base_url)
        expect(result_suffix).toBe(suffix)
    })
    it('should split url when there is a slash at the end', () => {
        const base_url = 'test.com/path1/path2/path3'
        const suffix = 'test_admin'
        const store_url = `https://${base_url}/${suffix}/?test=1&test=2`

        const [result_base, result_suffix] = split_url(store_url)
        expect(result_base).toBe(base_url)
        expect(result_suffix).toBe(suffix)
    })
})
