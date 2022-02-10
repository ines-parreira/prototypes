import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {RootState, StoreDispatch} from '../../../../../../state/types'
import LanguageSelect from '../LanguageSelect'
import {useCurrentHelpCenter} from '../../../providers/CurrentHelpCenter'
import {initialState as articlesState} from '../../../../../../state/helpCenter/articles/reducer'
import {initialState as uiState} from '../../../../../../state/helpCenter/ui/reducer'
import {initialState as categoriesState} from '../../../../../../state/helpCenter/categories/reducer'
import {getSingleHelpCenterResponseFixture} from '../../../fixtures/getHelpCentersResponse.fixture'
import {useSupportedLocales} from '../../../providers/SupportedLocales'
import {getLocalesResponseFixture} from '../../../fixtures/getLocalesResponse.fixtures'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenters: {
            '1': getSingleHelpCenterResponseFixture,
        },
    } as any,
    helpCenter: {
        ui: {...uiState, currentId: 1},
        articles: articlesState,
        categories: categoriesState,
    },
}
const store = mockStore(defaultState)

const mockedDispatch = jest.fn()
jest.mock('../../../../../../hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('../../../providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('../../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

describe('<LanguageSelect />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component', () => {
        const {container} = render(
            <Provider store={store}>
                <LanguageSelect />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call handleOnChangeLocale on language change', async () => {
        const {findByText} = render(
            <Provider store={store}>
                <LanguageSelect />
            </Provider>
        )

        const dropdownButton = await findByText(/English - USA/)

        dropdownButton.click()

        const selectButton = await findByText(/French/)

        selectButton.click()

        expect(mockedDispatch).toHaveBeenCalledTimes(1)
    })
})
