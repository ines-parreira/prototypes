import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { UserSettingType } from 'config/types/user'
import { view } from 'fixtures/views'
import { ViewType } from 'models/view/types'
import type { RootState } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import ViewNavbarView from '../ViewNavbarView'

const mockStore = configureMockStore()

describe('<ViewNavbarView />', () => {
    const customerView = {
        ...view,
        type: ViewType.CustomerList,
    }
    const defaultState: Partial<RootState> = {
        views: fromJS({
            active: customerView,
            items: [customerView],
        }),
    }

    it('should render view navbar', () => {
        const { getByText } = renderWithRouter(
            <Provider store={mockStore(defaultState)}>
                <ViewNavbarView
                    settingType={UserSettingType.CutomerViews}
                    viewType={ViewType.CustomerList}
                    isLoading={false}
                />
            </Provider>,
        )

        expect(getByText(/view_list/)).toBeInTheDocument()
        expect(getByText(/Views/)).toBeInTheDocument()
    })

    it('should render view count', () => {
        const { getByText } = renderWithRouter(
            <Provider
                store={mockStore({
                    views: fromJS({
                        active: customerView,
                        items: [customerView],
                        counts: {
                            [customerView.id]: 888,
                        },
                    }),
                })}
            >
                <ViewNavbarView
                    settingType={UserSettingType.CutomerViews}
                    viewType={ViewType.CustomerList}
                    isLoading={false}
                />
            </Provider>,
        )

        expect(getByText(/888/)).toBeInTheDocument()
    })
})
