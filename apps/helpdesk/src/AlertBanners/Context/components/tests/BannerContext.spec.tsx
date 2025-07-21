import React, { useContext } from 'react'

import { render, screen } from '@testing-library/react'

import { BannersContext, BannersDispatchContext } from '../../context'
import { BannersContextProvider } from '../BannerContext'

describe('BannersContextProvider', () => {
    it('should render children', () => {
        render(<BannersContextProvider>Test</BannersContextProvider>)
        expect(screen.getByText('Test')).toBeInTheDocument()
    })

    it('should set contexts with correct initial values', () => {
        const myContextSpy = jest.fn()
        const MyComponent = () => {
            const banners = useContext(BannersContext)
            const dispatch = useContext(BannersDispatchContext)
            myContextSpy(banners, dispatch)
            return <div>'Nailed it'</div>
        }
        render(
            <BannersContextProvider>
                <MyComponent />
            </BannersContextProvider>,
        )

        expect(myContextSpy).toHaveBeenCalledWith([], expect.any(Function))
    })
})
