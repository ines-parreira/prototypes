import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {initialState as helpCenterState} from 'state/entities/helpCenter/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {LocaleCode} from '../../../../../../models/helpCenter/types'
import {getSingleArticleEnglish} from '../../../fixtures/getArticlesResponse.fixture'
import {getLocalesResponseFixture} from '../../../fixtures/getLocalesResponse.fixtures'
import {useSupportedLocales} from '../../../providers/SupportedLocales'
import {getArticleUrl} from '../../../utils/helpCenter.utils'
import HelpCenterEditModalHeader, {
    Props as HelpCenterEditModalHeaderProps,
} from '../HelpCenterEditModalHeader'
import useCategoriesOptions from '../ArticleCategorySelect/hooks/useCategoriesOptions'

const windowOpenMock = jest.fn().mockReturnValue({
    focus: jest.fn(),
})

global.open = windowOpenMock

const mockedUseEditionManager = {
    selectedCategoryId: null,
    setSelectedCategoryId: jest.fn(),
    selectedArticle: null,
    selectedArticleLanguage: 'fr-FR' as LocaleCode,
}

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: helpCenterState,
    } as any,
    ui: {helpCenter: uiState} as any,
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

jest.mock('../ArticleCategorySelect/hooks/useCategoriesOptions')
;(useCategoriesOptions as jest.Mock).mockImplementation(() => [
    {label: '- No category -', value: 'null'},
    {label: 'Orders', value: 1},
    {label: 'Pricing', value: 2},
])

describe('<HelpCenterEditModalHeader />', () => {
    const props: HelpCenterEditModalHeaderProps = {
        title: getSingleArticleEnglish.translation.title,
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
            <Provider store={mockStore(defaultState)}>
                <HelpCenterEditModalHeader
                    {...props}
                    showCategorySelect={true}
                />
            </Provider>
        )
        expect(container).toMatchSnapshot('with the category selector')
    })

    it('should render an input when onEditTitle is defined', () => {
        const {container} = render(
            <HelpCenterEditModalHeader {...props} onTitleChange={() => null} />
        )

        expect(container).toMatchSnapshot()
    })

    it('should render a preview article button', () => {
        const articleUrl = getArticleUrl({
            domain: 'acme.gorgias.rehab',
            locale: getSingleArticleEnglish.translation.locale,
            slug: getSingleArticleEnglish.translation.slug,
            articleId: getSingleArticleEnglish.id,
        })

        const {container, getByRole} = render(
            <HelpCenterEditModalHeader {...props} previewUrl={articleUrl} />
        )

        expect(container).toMatchSnapshot()

        const previewBtn = getByRole('button', {name: /preview article/i})
        fireEvent.click(previewBtn)

        expect(windowOpenMock).toHaveBeenCalledWith(articleUrl, '_blank')
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

        it('should have a halfscreen button when the resize callback is in props and isFullscreen is true', () => {
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
