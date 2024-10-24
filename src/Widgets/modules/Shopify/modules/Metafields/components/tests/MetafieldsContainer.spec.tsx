import {fireEvent, render} from '@testing-library/react'
import React from 'react'

import MetafieldsContainer from '../MetafieldsContainer'

describe('<MetafieldsContainer />', () => {
    it('should expand when clicked', () => {
        const wrapper = render(
            <MetafieldsContainer>
                <div className={'test-class'}>expect when expanded</div>
            </MetafieldsContainer>
        )

        const clickWrapper = wrapper.getByTitle('Unfold this card')
        expect(clickWrapper).toBeInTheDocument()

        expect(wrapper.queryByText('expect when expanded')).toBeNull()
        fireEvent.click(clickWrapper)
        expect(wrapper.getByText('expect when expanded')).toBeInTheDocument()
    })
})
