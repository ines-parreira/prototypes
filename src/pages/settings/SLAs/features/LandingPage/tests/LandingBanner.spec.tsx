import React from 'react'
import {render} from '@testing-library/react'

import LandingBanner from '../LandingBanner'

describe('<LandingBanner />', () => {
    it('should display the banner', () => {
        const {getByText} = render(<LandingBanner />)

        expect(
            getByText(/Get started with service level agreements/)
        ).toBeInTheDocument()
        expect(getByText(/boost customer satisfaction/)).toBeInTheDocument()

        const image = document.querySelector('img') as HTMLImageElement
        expect(image.alt).toEqual('SLAs Banner')
    })
})
