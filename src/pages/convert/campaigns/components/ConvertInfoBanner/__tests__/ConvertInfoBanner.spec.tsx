import React from 'react'
import {render} from '@testing-library/react'

import ConvertInfoBanner from '../ConvertInfoBanner'

describe('<ConvertInfoBanner>', () => {
    it('renders component', () => {
        const bannerProps = {
            type: 'info',
            text: 'lorem ipsum',
        }

        const {getByText} = render(<ConvertInfoBanner {...bannerProps} />)

        const bannerText = getByText(bannerProps.text)
        expect(bannerText).toBeInTheDocument()
    })
})
