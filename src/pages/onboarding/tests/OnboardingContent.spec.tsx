import React from 'react'
import {render} from '@testing-library/react'

import OnboardingContent from '../OnboardingContent'

describe('<OnboardingContent />', () => {
    it('should display an empty container', () => {
        const {container} = render(<OnboardingContent />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
