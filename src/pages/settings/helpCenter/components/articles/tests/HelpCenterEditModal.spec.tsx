import React from 'react'
import {render} from '@testing-library/react'

import HelpCenterEditModal from '../HelpCenterEditModal'
import {HelpCenterArticleModalView} from '../HelpCenterEditArticleModalContent/types'

const mockedUseEditionManager = {
    isFullscreenEditModal: false,
    editModal: {
        isOpened: true,
        view: HelpCenterArticleModalView.BASIC,
    },
}

jest.mock('../../../providers/EditionManagerContext', () => {
    const module: Record<string, unknown> = jest.requireActual(
        '../../../providers/EditionManagerContext'
    )

    return {
        ...module,
        useEditionManager: () => mockedUseEditionManager,
    }
})

describe('<HelpCenterEditModal/>', () => {
    const props = {
        open: true,
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
        mockedUseEditionManager.isFullscreenEditModal = true
        const {container} = render(
            <HelpCenterEditModal {...props}>Modal content</HelpCenterEditModal>
        )
        expect(container).toMatchSnapshot()
    })
})
