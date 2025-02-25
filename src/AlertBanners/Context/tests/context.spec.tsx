import React, { useContext } from 'react'

import { render } from '@testing-library/react'

import { BannersContext, BannersDispatchContext } from '../context'

describe('AlertBanners default contexts', () => {
    it('should set contexts with correct initial values', () => {
        const myContextSpy = jest.fn()
        const MyComponent = () => {
            const banners = useContext(BannersContext)
            const bannersDispatch = useContext(BannersDispatchContext)
            myContextSpy(banners, bannersDispatch)
            return <div>ok</div>
        }

        render(<MyComponent />)

        expect(myContextSpy).toHaveBeenCalledWith([], expect.any(Function))
    })
})
