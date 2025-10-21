import { render } from '@testing-library/react'

import PhoneBarCallerDetailsContainer from '../PhoneBarCallerDetailsContainer'

describe('<PhoneBarCallerDetailsContainer/>', () => {
    it('should render children', () => {
        const { getByText } = render(
            <PhoneBarCallerDetailsContainer>
                <div>Test Content</div>
            </PhoneBarCallerDetailsContainer>,
        )

        expect(getByText('Test Content')).toBeInTheDocument()
    })
})
