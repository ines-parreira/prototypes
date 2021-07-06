import React from 'react'
import {render} from '@testing-library/react'

import HelpCenterEditModal from '../HelpCenterEditModal'
describe('<HelpCenterEditModal/>', () => {
    const props = {
        open: true,
        fullscreen: false,
        isLoading: false,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const {container} = render(
            <HelpCenterEditModal {...props}>Modal content</HelpCenterEditModal>
        )
        expect(container).toMatchSnapshot()
    })

    it('should display the component in fullscreen mode correctly', () => {
        const {container} = render(
            <HelpCenterEditModal {...props} fullscreen={true}>
                Modal content
            </HelpCenterEditModal>
        )
        expect(container).toMatchSnapshot()
    })
})
