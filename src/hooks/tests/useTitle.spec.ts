import {renderHook} from 'react-hooks-testing-library'

import useTitle from '../useTitle'

describe('useTitle hook', () => {
    const defaultTitle = 'test title'
    document.title = defaultTitle

    it('should do nothing if passed an empty value', () => {
        renderHook(() => useTitle(undefined))
        expect(document.title).toEqual(defaultTitle)
    })

    it('should set the title then restore it if passed a valid string', () => {
        const result = renderHook(() => useTitle('test'))
        expect(document.title).toEqual('test')

        result.unmount()
        expect(document.title).toEqual(defaultTitle)
    })
})
