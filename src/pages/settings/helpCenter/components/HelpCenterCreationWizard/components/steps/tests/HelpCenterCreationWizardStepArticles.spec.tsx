import 'tests/__mocks__/intersectionObserverMock'
import 'tests/__mocks__/editionManagerContextMock'

import React from 'react'
import {screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import userEvent from '@testing-library/user-event'
import Wizard from 'pages/common/components/wizard/Wizard'
import {
    HelpCenter,
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import {
    HelpCenterApiArticlesFixture,
    HelpCenterUiBasicsFixture,
} from 'pages/settings/helpCenter/fixtures/wizard.fixture'
import {renderWithRouter} from 'utils/testing'
import {
    ArticleTemplatesGroupedByCategoryFixture,
    HelpCenterArticleItemFixture,
} from 'pages/settings/helpCenter/fixtures/articleTemplate.fixture'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import {useGetHelpCenterArticles} from '../../../hooks/useGetHelpCenterArticles'
import HelpCenterCreationWizardStepArticles from '../HelpCenterCreationWizardStepArticles'
import {useHelpCenterCreationWizard} from '../../../hooks/useHelpCenterCreationWizard'
import {useHelpCenterArticlesForm} from '../../../hooks/useHelpCenterArticlesForm'

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    HelpCenterApiArticlesFixture
)

jest.mock('../../../hooks/useHelpCenterCreationWizard', () => ({
    useHelpCenterCreationWizard: jest.fn(),
}))
jest.mock('../../../hooks/useGetHelpCenterArticles', () => ({
    useGetHelpCenterArticles: jest.fn(),
}))
jest.mock('../../../hooks/useHelpCenterArticlesForm', () => ({
    useHelpCenterArticlesForm: jest.fn(),
}))

const mockUseGetHelpCenterArticles = jest.mocked(useGetHelpCenterArticles)
const mockUseHelpCenterCreationWizard = jest.mocked(useHelpCenterCreationWizard)
const mockUseHelpCenterArticlesForm = jest.mocked(useHelpCenterArticlesForm)

const mockedUseHelpCenterCreationWizard = {
    helpCenter: HelpCenterUiBasicsFixture,
    allStoreIntegrations: [],
    isLoading: false,
    handleFormUpdate: jest.fn(),
    handleSave: jest.fn(),
    handleAction: jest.fn(),
}

const mockedUseHelpCenterArticlesForm = {
    articles: ArticleTemplatesGroupedByCategoryFixture,
    selectedArticle: HelpCenterArticleItemFixture,
    hoveredArticle: null,
    isLoading: false,
    handleArticleSelect: jest.fn(),
    handleArticleHover: jest.fn(),
    handleArticleEdit: jest.fn(),
    handleEditorClose: jest.fn(),
    handleEditorReady: jest.fn(),
    handleEditorSave: jest.fn(),
    handleNavigationSave: jest.fn(),
}

const mockedUseGetHelpCenterArticles = {
    articles: ArticleTemplatesGroupedByCategoryFixture,
    hasAiArticles: false,
    isLoading: false,
}

const renderComponent = (fixtures?: {
    helpCenter?: HelpCenter
    automateType?: HelpCenterAutomateType
}) => {
    const {
        helpCenter = HelpCenterApiArticlesFixture,
        automateType = HelpCenterAutomateType.AUTOMATE,
    } = fixtures ?? {}

    const mockStore = configureMockStore([thunk])

    renderWithRouter(
        <Provider store={mockStore({})}>
            <Wizard steps={[HelpCenterCreationWizardStep.Articles]}>
                <HelpCenterCreationWizardStepArticles
                    helpCenter={helpCenter}
                    automateType={automateType}
                />
            </Wizard>
        </Provider>
    )
}

describe('<HelpCenterCreationWizardStepAutomate />', () => {
    beforeEach(() => {
        mockUseHelpCenterArticlesForm.mockReturnValue(
            mockedUseHelpCenterArticlesForm
        )
        mockUseHelpCenterCreationWizard.mockReturnValue(
            mockedUseHelpCenterCreationWizard
        )
        mockUseGetHelpCenterArticles.mockReturnValue(
            mockedUseGetHelpCenterArticles
        )
    })
    it('should render  categories for article templates', () => {
        renderComponent()

        const shippingAndDelivery = screen.getByText('Shipping & Delivery')
        const orderManagement = screen.getByText('Order Management')

        expect(shippingAndDelivery).toBeInTheDocument()
        expect(orderManagement).toBeInTheDocument()
    })

    describe('article footer', () => {
        it('should render actions for Automate account', () => {
            renderComponent({
                automateType: HelpCenterAutomateType.AUTOMATE,
            })

            const saveAndCustomizeLater = screen.getByText(
                'Save & Customize Later'
            )
            const backButton = screen.getByText('Back')
            const nextButton = screen.getByText('Next')

            expect(saveAndCustomizeLater).toBeInTheDocument()
            expect(backButton).toBeInTheDocument()
            expect(nextButton).toBeInTheDocument()
        })

        it('should render actions for non-automate account', () => {
            renderComponent({automateType: HelpCenterAutomateType.NON_AUTOMATE})

            const saveAndCustomizeLater = screen.getByText(
                'Save & Customize Later'
            )
            const finishButton = screen.getByText('Finish')

            expect(saveAndCustomizeLater).toBeInTheDocument()
            expect(finishButton).toBeInTheDocument()
        })

        it('should render actions for no store connections account', () => {
            renderComponent({
                automateType: HelpCenterAutomateType.AUTOMATE_NO_STORE,
            })

            const saveAndCustomizeLater = screen.getByText(
                'Save & Customize Later'
            )
            const finishButton = screen.getByText('Finish')

            expect(saveAndCustomizeLater).toBeInTheDocument()
            expect(finishButton).toBeInTheDocument()
        })

        it('should trigger handleNavigationSave on save and customize later action', () => {
            renderComponent()

            const saveAndCustomizeLater = screen.getByText(
                'Save & Customize Later'
            )

            userEvent.click(saveAndCustomizeLater)

            expect(
                mockedUseHelpCenterArticlesForm.handleNavigationSave
            ).toHaveBeenCalled()
        })

        it('should trigger handleNavigationSave on next action', () => {
            renderComponent()

            const nextButton = screen.getByText('Next')

            userEvent.click(nextButton)

            expect(
                mockedUseHelpCenterArticlesForm.handleNavigationSave
            ).toHaveBeenCalled()
        })

        it('should trigger handleNavigationSave on next action', () => {
            renderComponent({
                automateType: HelpCenterAutomateType.AUTOMATE_NO_STORE,
            })

            const finishButton = screen.getByText('Finish')

            userEvent.click(finishButton)

            expect(
                mockedUseHelpCenterArticlesForm.handleNavigationSave
            ).toHaveBeenCalled()
        })

        it('should trigger handleAction on back action', () => {
            renderComponent()

            const backButton = screen.getByText('Back')

            userEvent.click(backButton)

            expect(
                mockedUseHelpCenterCreationWizard.handleAction
            ).toHaveBeenCalled()
        })
    })

    describe('article editor', () => {
        it('should render article editor', async () => {
            renderComponent()

            await waitFor(() =>
                expect(
                    screen.getByText('How to cancel order')
                ).toBeInTheDocument()
            )

            const selectRow = screen.getByText('How to cancel order')
            const editArticleButton = selectRow.nextElementSibling!
            userEvent.click(editArticleButton)

            expect(screen.getByText('Save changes')).toBeInTheDocument()
            expect(screen.getByText('Discard changes')).toBeInTheDocument()
        })

        it('should trigger handleEditorClose on discard changes', () => {
            renderComponent()

            const selectRow = screen.getByText('How to cancel order')
            const editArticleButton = selectRow.nextElementSibling!
            userEvent.click(editArticleButton)

            const discardButton = screen.getByText('Discard changes')
            userEvent.click(discardButton)

            expect(
                mockedUseHelpCenterArticlesForm.handleEditorClose
            ).toHaveBeenCalled()
        })

        it('should trigger handleEditorSave on save changes', async () => {
            renderComponent()

            const selectRow = screen.getByText('How to cancel order')
            const editArticleButton = selectRow.nextElementSibling!
            userEvent.click(editArticleButton)

            const title = screen.getByPlaceholderText('Title')
            userEvent.clear(title)
            await userEvent.type(title, 'How to cancel order from store')

            const savedButton = screen.getByText('Save changes')
            userEvent.click(savedButton)

            expect(
                mockedUseHelpCenterArticlesForm.handleEditorSave
            ).toHaveBeenCalledWith(
                'How to cancel order from store',
                '<h1>How to cancel order</h1>'
            )
        })

        it('should disable save button if title is invalid', () => {
            renderComponent()

            const selectRow = screen.getByText('How to cancel order')
            const editArticleButton = selectRow.nextElementSibling!
            userEvent.click(editArticleButton)

            userEvent.clear(screen.getByPlaceholderText('Title'))

            const savedButton = screen.getByText('Save changes')

            expect(savedButton).toHaveClass('isDisabled')
        })
    })
})
