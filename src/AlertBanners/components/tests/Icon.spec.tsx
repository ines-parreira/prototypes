import {screen, render} from '@testing-library/react'
import React from 'react'

import {AlertBannerTypes} from '../../types'
import {Icon} from '../Icon'

describe('<Icon/>', () => {
    const types = [
        [AlertBannerTypes.Critical, 'error'] as const,
        [AlertBannerTypes.Warning, 'warning'] as const,
        [AlertBannerTypes.Info, 'info'] as const,
    ]

    it.each(types)(
        'should render the correct icon for type %s ',
        (type, icon) => {
            render(<Icon type={type} />)

            expect(screen.getByText(icon)).toBeInTheDocument()
        }
    )
})
