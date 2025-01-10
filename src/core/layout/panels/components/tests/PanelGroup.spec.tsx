import {render, screen} from '@testing-library/react'
import React from 'react'

import usePanelGroup from '../../hooks/usePanelGroup'
import PanelGroup from '../PanelGroup'

jest.mock('../../hooks/usePanelGroup', () => jest.fn())

describe('PanelGroup', () => {
    it('should render the panel group', () => {
        render(<PanelGroup subtractSize={10}>boop</PanelGroup>)
        const el = screen.getByText('boop')
        expect(el).toBeInTheDocument()
        expect(usePanelGroup).toHaveBeenCalledWith(10)
    })
})
