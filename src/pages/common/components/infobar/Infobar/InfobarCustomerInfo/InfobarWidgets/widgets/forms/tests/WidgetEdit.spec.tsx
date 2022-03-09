import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

import * as utils from 'utils'
import {IntegrationType} from 'models/integration/constants'
import * as actions from 'state/widgets/actions'
import {IntegrationContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/IntegrationContext'
import WidgetEdit from '../WidgetEdit'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

jest.spyOn(actions, 'updateEditedWidget')
jest.spyOn(actions, 'stopWidgetEdition')

const updateEditedWidget = actions.updateEditedWidget as jest.Mock
const stopWidgetEdition = actions.stopWidgetEdition as jest.Mock

jest.mock('utils', () => {
    const mockedUtils = jest.requireActual('utils')

    const result: typeof utils = {
        ...mockedUtils,
        uploadFiles: jest.fn(() => Promise.resolve([{url: 'file1'}])),
    }
    return result
})

describe('<WidgetEdit/>', () => {
    const props = {
        template: fromJS({
            title: 'Some Title',
        }),
        parent: fromJS({}),
        editionHiddenFields: [],
        isRootWidget: false,
        isParentList: false,
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
                            type: 'bamboozled',
                        }),
                    }}
                >
                    <WidgetEdit {...props} />
                </IntegrationContext.Provider>
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should hide the hidden fields', () => {
        const {container} = render(
            <Provider store={store}>
                <IntegrationContext.Provider
                    value={{
                        integrationId: null,
                        integration: fromJS({
                            type: 'bamboozled',
                        }),
                    }}
                >
                    <WidgetEdit
                        {...props}
                        editionHiddenFields={['displayCard', 'link']}
                    />
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
                            type: 'bamboozled',
                        }),
                    }}
                >
                    <WidgetEdit {...props} />
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
                    <WidgetEdit {...props} isRootWidget />
                </IntegrationContext.Provider>
            </Provider>
        )

        fireEvent.change(screen.getByLabelText('Title'), {
            target: {value: 'New Title'},
        })

        fireEvent.change(screen.getByLabelText('Link'), {
            target: {value: 'https://link.com'},
        })

        userEvent.upload(
            screen.getByLabelText('Widget icon'),
            new File(['hello'], 'hello.png', {type: 'image/png'})
        )

        fireEvent.click(screen.getByText('Pick a color'))
        await screen.findByPlaceholderText('ex: #eeeeee')
        fireEvent.click(screen.getByRole('button', {name: 'color #EB144C'}))

        fireEvent.click(screen.getByText('Submit'))
        expect(updateEditedWidget.mock.calls).toMatchSnapshot()
        expect(stopWidgetEdition.mock.calls).toMatchSnapshot()
    })
    it('should handle the list case', () => {
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
                            type: 'bamboozled',
                        }),
                    }}
                >
                    <WidgetEdit
                        editionHiddenFields={[]}
                        isRootWidget={false}
                        isParentList={true}
                        parent={fromJS({
                            title: 'List title',
                            meta: {
                                limit: 10,
                            },
                        })}
                        template={fromJS({
                            widgets: [
                                {
                                    type: 'widget',
                                    title: 'My value',
                                    path: 'value',
                                },
                            ],
                        })}
                    />
                </IntegrationContext.Provider>
            </Provider>
        )

        fireEvent.change(screen.getByLabelText('Limit'), {
            target: {value: 9},
        })

        fireEvent.change(screen.getByLabelText('Order by'), {
            target: {value: '-value'},
        })

        fireEvent.click(screen.getByText('Submit'))
        expect(updateEditedWidget.mock.calls).toMatchSnapshot()
        expect(stopWidgetEdition.mock.calls).toMatchSnapshot()
    })
})
