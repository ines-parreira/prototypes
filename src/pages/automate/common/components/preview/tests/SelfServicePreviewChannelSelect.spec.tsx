import {render, screen} from '@testing-library/react'
import React from 'react'

import SelfServicePreviewChannelSelect from '../SelfServicePreviewChannelSelect'

describe('<SelfServicePreviewChannelSelect />', () => {
    it('should render component', () => {
        render(
            <SelfServicePreviewChannelSelect
                onChange={jest.fn()}
                channels={[]}
            />
        )
        expect(screen.getByText('Channel')).toBeInTheDocument()
    })
})
