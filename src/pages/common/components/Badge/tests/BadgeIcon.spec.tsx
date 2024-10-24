import {render, screen} from '@testing-library/react'
import React from 'react'

import BadgeIcon from '../BadgeIcon'

describe('<BadgeIcon />', () => {
    it('should render a badge icon', () => {
        const onClick = jest.fn()
        render(<BadgeIcon icon="close" onClick={onClick} />)

        expect(screen.getByText('close')).toBeInTheDocument()

        screen.getByText('close').click()

        expect(onClick).toHaveBeenCalled()
    })
})
