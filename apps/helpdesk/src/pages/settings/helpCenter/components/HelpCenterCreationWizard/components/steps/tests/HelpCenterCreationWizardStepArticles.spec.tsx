import 'tests/__mocks__/editionManagerContextMock'
import 'tests/__mocks__/intersectionObserverMock'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import type { HelpCenter } from 'models/helpCenter/types'
import {
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import Wizard from 'pages/common/components/wizard/Wizard'
import {
    ArticleTemplatesGroupedByCategoryFixture,
    HelpCenterArticleItemFixture,
} from 'pages/settings/helpCenter/fixtures/articleTemplate.fixture'
import {
    HelpCenterApiArticlesFixture,
    HelpCenterUiBasicsFixture,
} from 'pages/settings/helpCenter/fixtures/wizard.fixture'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { mockStore, renderWithRouter } from 'utils/testing'

import { useGetHelpCenterArticles } from '../../../hooks/useGetHelpCenterArticles'
import { useHelpCenterArticlesForm } from '../../../hooks/useHelpCenterArticlesForm'
import { useHelpCenterCreationWizard } from '../../../hooks/useHelpCenterCreationWizard'
import HelpCenterWizardArticleEditor from '../../HelpCenterWizardArticleEditor/HelpCenterWizardArticleEditor'
import HelpCenterCreationWizardStepArticles from '../HelpCenterCreationWizardStepArticles'

jest.mock('../../HelpCenterWizardArticleEditor/HelpCenterWizardArticleEditor')
;(HelpCenterWizardArticleEditor as jest.Mock).mockReturnValue(<></>)

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    HelpCenterApiArticlesFixture,
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

    renderWithRouter(
        <Provider store={mockStore({})}>
            <Wizard steps={[HelpCenterCreationWizardStep.Articles]}>
                <HelpCenterCreationWizardStepArticles
                    helpCenter={helpCenter}
                    automateType={automateType}
                />
            </Wizard>
        </Provider>,
    )
}

describe('<HelpCenterCreationWizardStepAutomate />', () => {
    beforeEach(() => {
        mockUseHelpCenterArticlesForm.mockReturnValue(
            mockedUseHelpCenterArticlesForm,
        )
        mockUseHelpCenterCreationWizard.mockReturnValue(
            mockedUseHelpCenterCreationWizard,
        )
        mockUseGetHelpCenterArticles.mockReturnValue(
            mockedUseGetHelpCenterArticles,
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
        it('should render actions for AI Agent account', () => {
            renderComponent({
                automateType: HelpCenterAutomateType.AUTOMATE,
            })

            const saveAndCustomizeLater = screen.getByText(
                'Save & Customize Later',
            )
            const backButton = screen.getByText('Back')
            const nextButton = screen.getByText('Next')

            expect(saveAndCustomizeLater).toBeInTheDocument()
            expect(backButton).toBeInTheDocument()
            expect(nextButton).toBeInTheDocument()
        })

        it('should render actions for non-automate account', () => {
            renderComponent({
                automateType: HelpCenterAutomateType.NON_AUTOMATE,
            })

            const saveAndCustomizeLater = screen.getByText(
                'Save & Customize Later',
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
                'Save & Customize Later',
            )
            const finishButton = screen.getByText('Finish')

            expect(saveAndCustomizeLater).toBeInTheDocument()
            expect(finishButton).toBeInTheDocument()
        })

        it('should trigger handleNavigationSave on save and customize later action', async () => {
            renderComponent()

            const saveAndCustomizeLater = screen.getByText(
                'Save & Customize Later',
            )

            fireEvent.click(saveAndCustomizeLater)

            expect(
                mockedUseHelpCenterArticlesForm.handleNavigationSave,
            ).toHaveBeenCalled()
        })

        it('should trigger handleNavigationSave on next action', async () => {
            renderComponent()

            const nextButton = screen.getByText('Next')

            fireEvent.click(nextButton)

            expect(
                mockedUseHelpCenterArticlesForm.handleNavigationSave,
            ).toHaveBeenCalled()
        })

        it('should trigger handleNavigationSave on next action', async () => {
            renderComponent({
                automateType: HelpCenterAutomateType.AUTOMATE_NO_STORE,
            })

            const finishButton = screen.getByText('Finish')

            fireEvent.click(finishButton)

            expect(
                mockedUseHelpCenterArticlesForm.handleNavigationSave,
            ).toHaveBeenCalled()
        })

        it('should trigger handleAction on back action', async () => {
            renderComponent({
                automateType: HelpCenterAutomateType.AUTOMATE,
            })

            const backButton = screen.getByText('Back')

            fireEvent.click(backButton)

            await waitFor(() => {
                expect(
                    mockedUseHelpCenterCreationWizard.handleAction,
                ).toHaveBeenCalled()
            })
        })
    })
})
