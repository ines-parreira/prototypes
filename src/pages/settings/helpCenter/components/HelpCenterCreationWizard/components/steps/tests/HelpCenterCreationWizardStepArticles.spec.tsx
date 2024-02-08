import 'tests/__mocks__/intersectionObserverMock'

import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import Wizard from 'pages/common/components/wizard/Wizard'
import {
    HelpCenterArticleItem,
    HelpCenterAutomateType,
    HelpCenterCreationWizardStep,
} from 'models/helpCenter/types'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import {EditionManagerContextProvider} from 'pages/settings/helpCenter/providers/EditionManagerContext'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {useGetHelpCenterArticles} from '../../../hooks/useGetHelpCenterArticles'
import HelpCenterCreationWizardStepArticles from '../HelpCenterCreationWizardStepArticles'

const helpCenterFixture = getHelpCentersResponseFixture.data[0]

jest.mock('../../../hooks/useGetHelpCenterArticles', () => ({
    useGetHelpCenterArticles: jest.fn(),
}))

const mockedUseGetHelpCenterArticles = jest.mocked(useGetHelpCenterArticles)

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': helpCenterFixture,
                },
            },
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: {helpCenter: {...uiState, currentId: 1}} as any,
}

const renderComponent = () => {
    render(
        <Provider store={mockedStore(defaultState)}>
            <CurrentHelpCenterContext.Provider value={helpCenterFixture}>
                <Wizard steps={[HelpCenterCreationWizardStep.Articles]}>
                    <EditionManagerContextProvider>
                        <HelpCenterCreationWizardStepArticles
                            helpCenter={helpCenterFixture}
                            automateType={HelpCenterAutomateType.AUTOMATE}
                        />
                    </EditionManagerContextProvider>
                </Wizard>
            </CurrentHelpCenterContext.Provider>
        </Provider>
    )
}

describe('<HelpCenterCreationWizardStepAutomate />', () => {
    beforeEach(() => {
        mockedUseGetHelpCenterArticles.mockReturnValue({
            articles: {
                orderManagement: [
                    {
                        key: 'howToCancelOrder',
                        title: 'How do I cancel my order?',
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

    it('should open editor', async () => {
        renderComponent()

        await waitFor(() =>
            expect(
                screen.getByText('How do I cancel my order?')
            ).toBeInTheDocument()
        )

        const selectRow = screen.getByText('How do I cancel my order?')

        const editArticleButton = selectRow.nextElementSibling!

        fireEvent.click(editArticleButton)

        expect(
            screen.queryAllByDisplayValue('How do I cancel my order?')
        ).toHaveLength(1)

        expect(screen.getByText('Discard changes')).toBeInTheDocument()
    })
})
