import React from 'react'
import {render} from '@testing-library/react'

import ReferralContent from '../ReferralContent'

describe('<ReferralContent />', () => {
    it('should display an empty container', () => {
        const {container} = render(<ReferralContent />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
