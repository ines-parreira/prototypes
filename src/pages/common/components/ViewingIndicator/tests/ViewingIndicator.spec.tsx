import React from 'react'
import {render} from '@testing-library/react'

import ViewingIndicator from 'pages/common/components/ViewingIndicator/ViewingIndicator'

describe('<ViewingIndicator />', () => {
    it('should render the component', () => {
        const {getByText} = render(
            <ViewingIndicator title="test" className="test" />
        )

        expect(getByText('remove_red_eye')).toBeInTheDocument()
    })

    it('should allow custom class name', () => {
        const {container} = render(
            <ViewingIndicator title="test" className="test" />
        )

        expect(container.firstChild).toHaveClass('test')
    })

    it('should allow rendering to the right position', () => {
        const {container} = render(
            <ViewingIndicator title="test" position="right" />
        )

        expect(container.firstChild).toHaveClass('right')
    })
})
