import React, {ComponentProps} from 'react'
import {fromJS, Map} from 'immutable'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {IntegrationContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/IntegrationContext'

import {AfterTitle, TitleWrapper} from '../Order'

const mockStore = configureMockStore([thunk])
const integrationContextData = {integration: fromJS({}), integrationId: 1}

describe('Order', () => {
    describe('<AfterTitle/>', () => {
        const minProps = {
            source: fromJS({}),
            isEditing: false,
            getIntegrationData: () => fromJS({}) as Map<any, any>,
        } as unknown as ComponentProps<typeof AfterTitle>

        it('should not render because widgets are being edited', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider value={integrationContextData}>
                        <AfterTitle {...minProps} isEditing />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should not render because no integration id was provided', () => {
            const {container} = render(<AfterTitle {...minProps} />)

            expect(container).toMatchSnapshot()
        })

        it('should match snapshot', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider
                        value={{
                            integrationId: 1,
                            integration: fromJS({
                                meta: {store_hash: 'pk360c6roo'},
                            }),
                        }}
                    >
                        <AfterTitle
                            {...minProps}
                            source={fromJS({
                                status: 'completed',
                            })}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })
    })

    describe('<TitleWrapper/>', () => {
        const minProps = {
            source: fromJS({}),
            template: fromJS({}),
            getIntegrationData: () => fromJS({}) as Map<any, any>,
        } as unknown as ComponentProps<typeof TitleWrapper>

        it('should render default link', () => {
            const {container} = render(
                <Provider store={mockStore({})}>
                    <IntegrationContext.Provider
                        value={{
                            integrationId: 1,
                            integration: fromJS({
                                meta: {store_hash: 'pk360c6roo'},
                            }),
                        }}
                    >
                        <TitleWrapper
                            {...minProps}
                            source={fromJS({
                                id: 2345,
                            })}
                        />
                    </IntegrationContext.Provider>
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
