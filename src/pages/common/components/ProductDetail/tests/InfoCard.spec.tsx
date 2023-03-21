import React from 'react'
import {render} from '@testing-library/react'

import InfoCard from 'pages/common/components/ProductDetail/InfoCard'

import {dummyInfocard} from './fixtures'

describe(`InfoCard`, () => {
    it('should not render', () => {
        const {container} = render(<InfoCard {...dummyInfocard} isHidden />)

        expect(container.firstChild).toBe(null)
    })
})
