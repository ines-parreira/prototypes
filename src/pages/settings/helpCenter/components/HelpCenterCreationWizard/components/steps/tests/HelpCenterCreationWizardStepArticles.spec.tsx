import 'tests/__mocks__/intersectionObserverMock'

import React from 'react'
import {render, screen} from '@testing-library/react'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import Wizard from 'pages/common/components/wizard/Wizard'
import {
    HelpCenterArticleItem,
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import HelpCenterCreationWizardStepArticles from '../HelpCenterCreationWizardStepArticles'
import {useHelpCenterCreationWizard} from '../../../hooks/useHelpCenterCreationWizard'
import {mapApiHelpCenterToUIHelpCenter} from '../../../HelpCenterCreationWizardUtils'
import {useHelpCenterArticles} from '../../../hooks/useHelpCenterArticles'

const helpCenterFixture = getHelpCentersResponseFixture.data[0]
const helpCenterFixtureUI = mapApiHelpCenterToUIHelpCenter(
    helpCenterFixture,
    []
)

jest.mock('../../../hooks/useHelpCenterCreationWizard', () => ({
    useHelpCenterCreationWizard: jest.fn(),
}))
jest.mock('../../../hooks/useHelpCenterArticles', () => ({
    useHelpCenterArticles: jest.fn(),
}))

const mockUseHelpCenterCreationWizard = jest.mocked(useHelpCenterCreationWizard)
const mockedHook = {
    helpCenter: helpCenterFixtureUI,
    allStoreIntegrations: [],
    handleFormUpdate: jest.fn(),
    handleSave: jest.fn(),
    handleAction: jest.fn(),
    isLoading: false,
}

const mockedUseHelpCenterArticles = jest.mocked(useHelpCenterArticles)

const renderComponent = () => {
    render(
        <CurrentHelpCenterContext.Provider value={helpCenterFixture}>
            <Wizard steps={[HelpCenterCreationWizardStep.Branding]}>
                <HelpCenterCreationWizardStepArticles
                    helpCenter={helpCenterFixture}
                    automateType={HelpCenterAutomateType.AUTOMATE}
                />
            </Wizard>
        </CurrentHelpCenterContext.Provider>
    )
}

describe('<HelpCenterCreationWizardStepAutomate />', () => {
    beforeEach(() => {
        mockUseHelpCenterCreationWizard.mockReturnValue(mockedHook)
        mockedUseHelpCenterArticles.mockReturnValue({
            articles: {
                orderManagement: [
                    {
                        key: 'howToCancelOrder',
                        title: 'How do I cancel my order',
                    } as HelpCenterArticleItem,
                ],
                returnsAndRefunds: [
                    {
                        key: 'howToReturn',
                        title: 'How do I make a return?',
                    } as HelpCenterArticleItem,
                ],
                shippingAndDelivery: [
                    {
                        key: 'shippingPolicy',
                        title: 'How do I track my order?',
                    } as HelpCenterArticleItem,
                ],
            },
            isLoading: false,
        })
    })
    it('should render', () => {
        renderComponent()

        expect(
            screen.getByText('Add articles using templates')
        ).toBeInTheDocument()
    })
})
