import React from 'react'
import {render, fireEvent} from '@testing-library/react'

import {LocaleCode} from '../../../../../../models/helpCenter/types'
import {useSupportedLocales} from '../../../providers/SupportedLocales'
import {getLocalesResponseFixture} from '../../../fixtures/getLocalesResponse.fixtures'
import HelpCenterEditModalHeader, {
    Props as HelpCenterEditModalHeaderProps,
} from '../HelpCenterEditModalHeader'

const mockedUseEditionManager = {
    selectedCategoryId: null,
    setSelectedCategoryId: jest.fn(),
    selectedArticle: null,
    selectedArticleLanguage: 'fr-FR' as LocaleCode,
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

const mockedOnLanguageSelect = jest.fn()
const mockedOnClose = jest.fn()
const mockedOnResize = jest.fn()
const mockedOnArticleLanguageSelectActionClick = jest.fn()

jest.mock('../../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

describe('<HelpCenterEditModalHeader />', () => {
    const props: HelpCenterEditModalHeaderProps = {
        title: 'Article',
        supportedLocales: ['en-US', 'fr-FR'] as LocaleCode[],
        onLanguageSelect: mockedOnLanguageSelect,
        onClose: mockedOnClose,
        onArticleLanguageSelectActionClick:
            mockedOnArticleLanguageSelectActionClick,
        helpCenterId: 1,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display the component correctly - without the category selector', () => {
        const {container} = render(<HelpCenterEditModalHeader {...props} />)
        expect(container).toMatchSnapshot('without the category selector')
    })

    it('should display the component correctly - with the category selector', () => {
        const {container} = render(
            <HelpCenterEditModalHeader {...props} showCategorySelect={true} />
        )
        expect(container).toMatchSnapshot('with the category selector')
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
