import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import HelpCenterEditModalHeader from '../HelpCenterEditModalHeader'
import {getLocalesResponseFixture} from '../../../fixtures/getLocalesResponse.fixtures'

const mockedOnChangeLanguage = jest.fn()
const mockedOnClose = jest.fn()
const mockedOnResize = jest.fn()

describe('<HelpCenterEditModalHeader/>', () => {
    const props = {
        title: 'Article',
        language: 'fr-fr',
        languageOptions: getLocalesResponseFixture,
        onChangeLanguage: mockedOnChangeLanguage,
        onClose: mockedOnClose,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const {container} = render(<HelpCenterEditModalHeader {...props} />)
        expect(container).toMatchSnapshot()
    })

    describe('resize modal buttons', () => {
        it('should not have a fullscreen button when the resize callback is not in props', () => {
            const {queryByRole} = render(
                <HelpCenterEditModalHeader {...props} />
            )
            const fullscreenBtn = queryByRole('button', {name: /fullscreen/i})

            expect(fullscreenBtn).toBeNull()
        })
        it('should have a fullscreen button when the resize callback is in props', () => {
            const {getByRole} = render(
                <HelpCenterEditModalHeader
                    {...props}
                    onResize={mockedOnResize}
                />
            )
            const fullscreenBtn = getByRole('button', {name: /fullscreen/i})
            fireEvent.click(fullscreenBtn)
            expect(mockedOnResize).toHaveBeenCalledTimes(1)
        })

        it('should have a fullscreen button when the resize callback is in props', () => {
            const {getByRole} = render(
                <HelpCenterEditModalHeader
                    {...props}
                    onResize={mockedOnResize}
                    isFullscreen={true}
                />
            )
            const halfScreenBtn = getByRole('button', {name: /halfscreen/i})
            fireEvent.click(halfScreenBtn)
            expect(mockedOnResize).toHaveBeenCalledTimes(1)
        })
    })
})
