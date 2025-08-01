import React, { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { fetchWidgets, selectContext } from 'state/widgets/actions'

import { Infobar } from '../../../common/components/infobar/Infobar/Infobar'
import { CustomerInfobarContainer } from '../CustomerInfobarContainer'

jest.mock('state/widgets/actions')
jest.mock(
    '../../../common/components/infobar/Infobar/Infobar',
    () =>
        ({
            sources,
            isRouteEditingWidgets,
            identifier,
            customer,
            widgets,
            context,
        }: ComponentProps<typeof Infobar>) => (
            <div>
                <div>Infobar</div>
                <div>sources: {JSON.stringify(sources)}</div>
                <div>isRouteEditingWidgets: {isRouteEditingWidgets}</div>
                <div>identifier: {identifier}</div>
                <div>customer: {customer.toArray()}</div>
                <div>widgets: {JSON.stringify(widgets)}</div>
                <div>context: {context}</div>
            </div>
        ),
)

const mockedSelectContext = assumeMock(selectContext)
const mockedFetchWidgets = assumeMock(fetchWidgets)
const mockStore = configureMockStore([thunk])
const store = mockStore({})
store.dispatch = jest.fn()

describe('<CustomerInfobarContainer />', () => {
    const minProps = {
        activeCustomer: fromJS({ name: 'Don Draper' }),
        activeCustomerId: 1,
        isEditingWidgets: false,
        sources: fromJS({
            ticket: fromJS({
                customer: fromJS({}),
            }),
            customer: fromJS({}),
        }),
        widgets: fromJS({}),
    } as unknown as ComponentProps<typeof CustomerInfobarContainer>

    it('should render infobar for active customer', () => {
        const { container } = render(
            <Provider store={store}>
                <CustomerInfobarContainer {...minProps} />
            </Provider>,
        )

        expect(mockedSelectContext).toHaveBeenCalledWith('customer')
        expect(mockedFetchWidgets).toHaveBeenCalled()
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render anything without a customer id', () => {
        const { container } = render(
            <Provider store={store}>
                <CustomerInfobarContainer
                    {...minProps}
                    activeCustomerId={null}
                />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
