import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import Integration from '../Integration'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('<Integration/>', () => {
    const minProps: ComponentProps<typeof Integration> = {
        integration: fromJS({}),
        loading: fromJS({}),
        redirectUri: '',
    }

    it('should render a loader because the integration is loading', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <Integration
                    {...minProps}
                    loading={fromJS({integration: true})}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should say the import is in progress', () => {
        renderWithRouter(
            <Provider store={store}>
                <Integration
                    {...minProps}
                    integration={fromJS({
                        meta: {
                            import_state: {is_over: false},
                        },
                    })}
                />
            </Provider>
        )

        expect(screen.getByText(/Import in progress/))
    })

    it('should say that the import is over', () => {
        renderWithRouter(
            <Provider store={store}>
                <Integration
                    {...minProps}
                    integration={fromJS({
                        meta: {
                            import_state: {is_over: true},
                        },
                    })}
                />
            </Provider>
        )

        expect(screen.getByText(/All your Magento2 customers/))
    })

    it('should show the one click editor if installation was not manual', () => {
        renderWithRouter(
            <Provider store={store}>
                <Integration
                    {...minProps}
                    integration={fromJS({
                        meta: {
                            is_manual: false,
                        },
                    })}
                />
            </Provider>
        )

        expect(screen.queryByLabelText(/Consumer key/)).toBe(null)
    })

    it('should show the manual editor if installation was manual', () => {
        renderWithRouter(
            <Provider store={store}>
                <Integration
                    {...minProps}
                    integration={fromJS({
                        meta: {
                            is_manual: true,
                        },
                    })}
                />
            </Provider>
        )

        expect(screen.getByLabelText(/Consumer key/))
    })
})
