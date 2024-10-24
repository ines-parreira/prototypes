import {render} from '@testing-library/react'
import React from 'react'

import Badge, {BadgeType} from '../Badge'

describe('<Badge />', () => {
    it('should render a badge', () => {
        const {container} = render(
            <Badge type={BadgeType.Success} text="success" />
        )
        expect(container).toMatchSnapshot()
    })
})
