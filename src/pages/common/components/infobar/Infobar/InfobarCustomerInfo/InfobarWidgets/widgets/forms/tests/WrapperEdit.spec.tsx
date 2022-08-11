import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import {IntegrationType} from 'models/integration/constants'
import * as actions from 'state/widgets/actions'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import WrapperEdit from '../WrapperEdit'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

jest.spyOn(actions, 'updateEditedWidget')
jest.spyOn(actions, 'stopWidgetEdition')

const updateEditedWidget = actions.updateEditedWidget as jest.Mock
const stopWidgetEdition = actions.stopWidgetEdition as jest.Mock

describe('<WrapperEdit/>', () => {
    const props = {
        template: fromJS({
            title: 'Some Title',
        }),
        onClose: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const {container} = render(
            <Provider store={store}>
                <IntegrationContext.Provider
                    value={{
                        integrationId: null,
                        integration: fromJS({
                            type: IntegrationType.Http,
                        }),
                    }}
                >
                    <WrapperEdit {...props} />
                </IntegrationContext.Provider>
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should call the correct action when cancelling', () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <IntegrationContext.Provider
                    value={{
                        integrationId: null,
                        integration: fromJS({
                            type: IntegrationType.Http,
                        }),
                    }}
                >
                    <WrapperEdit {...props} />
                </IntegrationContext.Provider>
            </Provider>
        )

        fireEvent.click(screen.getByText('Cancel'))
        expect(updateEditedWidget.mock.calls).toMatchSnapshot()
        expect(stopWidgetEdition.mock.calls).toMatchSnapshot()
    })

    it('should call the correct action with correct data when submitting the form', async () => {
        render(
            <Provider
                store={mockStore({
                    customers: fromJS({active: {}}),
                })}
            >
                <IntegrationContext.Provider
                    value={{
                        integrationId: null,
                        integration: fromJS({
                            type: IntegrationType.Http,
                        }),
                    }}
                >
                    <WrapperEdit {...props} />
                </IntegrationContext.Provider>
            </Provider>
        )

        fireEvent.click(screen.getByText('Pick a color'))
        await screen.findByPlaceholderText('ex: #eeeeee')
        fireEvent.click(screen.getByRole('button', {name: 'color #EB144C'}))

        fireEvent.click(screen.getByText('Submit'))
        expect(updateEditedWidget.mock.calls).toMatchSnapshot()
        expect(stopWidgetEdition.mock.calls).toMatchSnapshot()
    })
})
