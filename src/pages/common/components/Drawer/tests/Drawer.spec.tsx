import React from 'react'
import {render} from '@testing-library/react'

import {Drawer} from '../Drawer'

describe('<Drawer/>', () => {
    const props = {
        open: true,
        name: 'test',
        fullscreen: false,
        isLoading: false,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const {container} = render(<Drawer {...props}>Modal content</Drawer>)
        expect(container).toMatchSnapshot()
    })

    it('should display the component in fullscreen mode correctly', () => {
        const {container} = render(
            <Drawer {...props} fullscreen={true}>
                Modal content
            </Drawer>
        )
        expect(container).toMatchSnapshot()
    })
})
