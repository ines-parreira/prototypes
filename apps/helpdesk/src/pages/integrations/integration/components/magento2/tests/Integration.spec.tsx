import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Integration } from '../Integration'

const mockStore = configureMockStore([thunk])
const store = mockStore({})
describe('<Integration/>', () => {
    const minProps: ComponentProps<typeof Integration> = {
        integration: fromJS({}),
        loading: fromJS({}),
        redirectUri: '',
    }
    it('should render a loader because the integration is loading', () => {
        const { container } = render(
            <Integration
                {...minProps}
                loading={fromJS({ integration: true })}
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(container).toMatchSnapshot()
    })
    it('should say the import is in progress', () => {
        render(
            <Integration
                {...minProps}
                integration={fromJS({
                    meta: {
                        import_state: { is_over: false },
                    },
                })}
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(screen.getByText(/Import in progress/))
    })
    it('should say that the import is over', () => {
        render(
            <Integration
                {...minProps}
                integration={fromJS({
                    meta: {
                        import_state: { is_over: true },
                    },
                })}
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(screen.getByText(/All your Magento2 customers/))
    })
    it('should show the one click editor if installation was not manual', () => {
        render(
            <Integration
                {...minProps}
                integration={fromJS({
                    meta: {
                        is_manual: false,
                    },
                })}
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(screen.queryByLabelText(/Consumer key/)).toBe(null)
    })
    it('should show the manual editor if installation was manual', () => {
        render(
            <Integration
                {...minProps}
                integration={fromJS({
                    meta: {
                        is_manual: true,
                    },
                })}
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(screen.getByLabelText(/Consumer key/))
    })
})
