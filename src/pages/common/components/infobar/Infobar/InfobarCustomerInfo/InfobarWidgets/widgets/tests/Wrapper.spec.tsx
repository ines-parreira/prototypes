import React from 'react'
import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {EditionContext} from 'providers/infobar/EditionContext'
import {IntegrationType} from 'models/integration/types'
import * as actions from 'state/widgets/actions'
import Wrapper from '../Wrapper'

jest.spyOn(actions, 'removeEditedWidget')

const removeEditedWidget = actions.removeEditedWidget as jest.Mock

const mockStore = configureMockStore([thunk])

const store = mockStore({
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: 'http',
                name: 'my little http integration',
            },
            {
                id: 2,
                type: 'shopify',
                name: 'my little shopify integration',
            },
        ],
    }),
})

const shopifyWidget = {
    id: 4,
    type: IntegrationType.Shopify,
    integration_id: 1,
    template: {
        type: 'wrapper',
        widgets: [],
    },
    order: 1,
}

const shopifySource = fromJS({foo: 'foo value'})

const httpWidget = {
    id: 5,
    type: IntegrationType.Http,
    integration_id: 2,
    template: {
        type: 'wrapper',
        widgets: [],
    },
    order: 2,
}

const httpSource = fromJS({bar: 'bar value'})

describe('InfobarWidgets component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display (without an edit or a remove icon)', () => {
        const {container} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: false}}>
                    <Wrapper
                        template={fromJS({
                            ...shopifyWidget.template,
                            templatePath: 'templatePath',
                            absolutePath: ['absolute', 'path'],
                        })}
                        widget={fromJS(shopifyWidget)}
                        source={shopifySource}
                        editing={undefined}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should call the appropriate callback when clicking remove icon in edit mode', () => {
        render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <Wrapper
                        template={fromJS({
                            ...shopifyWidget.template,
                            templatePath: 'templatePath',
                            absolutePath: ['absolute', 'path'],
                        })}
                        widget={fromJS(shopifyWidget)}
                        source={httpSource}
                        editing={undefined}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(screen.queryByText('edit')).toBeNull()
        fireEvent.click(screen.getAllByText('delete')[0])
        expect(removeEditedWidget.mock.calls).toMatchSnapshot()
    })

    it('should open and close the edit modal correctly', async () => {
        render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <Wrapper
                        template={fromJS({
                            ...httpWidget.template,
                            templatePath: 'templatePath',
                            absolutePath: ['absolute', 'path'],
                        })}
                        widget={fromJS(httpWidget)}
                        source={shopifySource}
                        editing={undefined}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        fireEvent.click(screen.getAllByText('edit')[0])
        expect(screen.findByText('Border color'))
        fireEvent.click(screen.getByText('Cancel'))
        await waitFor(() => {
            expect(screen.queryByText('Border color')).toBeNull()
        })
    })

    it('should have the proper color set', () => {
        const {container} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <Wrapper
                        template={fromJS({
                            ...httpWidget.template,
                            meta: {
                                color: '#fff',
                            },
                            templatePath: 'templatePath',
                            absolutePath: ['absolute', 'path'],
                        })}
                        widget={fromJS(httpWidget)}
                        source={shopifySource}
                        editing={undefined}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
