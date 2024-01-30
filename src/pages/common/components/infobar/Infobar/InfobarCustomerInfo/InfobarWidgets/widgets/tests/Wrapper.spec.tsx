import React, {ComponentProps, ReactNode} from 'react'
import {render, fireEvent, screen, waitFor} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Action} from 'redux'

import {renderHook} from '@testing-library/react-hooks'
import {EditionContext} from 'providers/infobar/EditionContext'
import {IntegrationType} from 'models/integration/types'
import * as actions from 'state/widgets/actions'
import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'
import WrapperEditForm, {FormData} from 'infobar/ui/WrapperEditForm'
import {assumeMock} from 'utils/testing'

import Wrapper, {
    CUSTOMIZE_WIDGET_BUTTON_TEXT,
    DELETE_WIDGET_BUTTON_TEXT,
    useIntegration,
} from '../Wrapper'

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
            {
                id: 3,
                type: IntegrationType.Ecommerce,
                name: 'my little ecommerce integration',
            },
        ],
    }),
})

const shopifyWidget = {
    id: 4,
    type: IntegrationType.Shopify,
    integration_id: 2,
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
    integration_id: 1,
    template: {
        type: 'wrapper',
        widgets: [],
    },
    order: 2,
}

const httpSource = fromJS({bar: 'bar value'})

const customerExternalDataWidget = {
    id: 6,
    type: CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    app_id: '5dfgsadsasad',
    template: {
        type: 'wrapper',
        widgets: [],
    },
    order: 3,
}

const customerExternalDataSource = fromJS({
    bar: 'bar value',
    [THIRD_PARTY_APP_NAME_KEY]: 'my-wonderful-app-name',
})

const woocommerceDataWidget = {
    id: 6,
    type: WOOCOMMERCE_WIDGET_TYPE,
    integration_id: 3,
    template: {
        type: 'wrapper',
        widgets: [],
    },
    order: 3,
}

const woocommerceDataSource = fromJS({
    foo: 'bar',
    store: {
        helpdesk_integration_id: 3,
    },
})

const MOCK_EDIT_FORM_COLOR_ID = 'edit-form-color'
jest.mock('infobar/ui/WrapperEditForm', () =>
    jest.fn((props: ComponentProps<typeof WrapperEditForm>) => (
        <div>
            <span data-testid={MOCK_EDIT_FORM_COLOR_ID}>
                {props.initialData.color}
            </span>
        </div>
    ))
)
const WrapperEditFormMock = assumeMock(WrapperEditForm)

describe('InfobarWidgets component', () => {
    const defaultTemplatePath = 'templatePath'
    const defaultAbsolutePath = ['absolute', 'path']

    beforeEach(() => {
        store.clearActions()
    })

    it('should display (without an edit or a remove icon)', () => {
        const {container} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: false}}>
                    <Wrapper
                        template={fromJS({
                            ...shopifyWidget.template,
                            templatePath: defaultTemplatePath,
                            absolutePath: defaultAbsolutePath,
                        })}
                        widget={fromJS(shopifyWidget)}
                        source={shopifySource}
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
                            templatePath: defaultTemplatePath,
                            absolutePath: defaultAbsolutePath,
                        })}
                        widget={fromJS(shopifyWidget)}
                        source={httpSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(screen.queryByText('edit')).toBeNull()
        fireEvent.click(screen.getAllByText(DELETE_WIDGET_BUTTON_TEXT)[0])
        expect(removeEditedWidget.mock.calls).toMatchSnapshot()
    })

    it('should open and close the edit modal correctly', async () => {
        render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <Wrapper
                        template={fromJS({
                            ...httpWidget.template,
                            templatePath: defaultTemplatePath,
                            absolutePath: defaultAbsolutePath,
                        })}
                        widget={fromJS(httpWidget)}
                        source={shopifySource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        fireEvent.click(screen.getAllByText('edit')[0])
        expect(screen.findByText('Border color'))
        WrapperEditFormMock.mock.calls.slice(-1)[0][0].onCancel()
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
                            templatePath: defaultTemplatePath,
                            absolutePath: defaultAbsolutePath,
                        })}
                        widget={fromJS(httpWidget)}
                        source={shopifySource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render customer external data widget with the proper id', () => {
        const {container} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: false}}>
                    <Wrapper
                        template={fromJS({
                            ...customerExternalDataWidget.template,
                            templatePath: defaultTemplatePath,
                            absolutePath: defaultAbsolutePath,
                        })}
                        widget={fromJS(customerExternalDataWidget)}
                        source={customerExternalDataSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render woocommerce widget with the proper id', () => {
        const {container} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: false}}>
                    <Wrapper
                        template={fromJS({
                            ...woocommerceDataWidget.template,
                            templatePath: defaultTemplatePath,
                            absolutePath: defaultAbsolutePath,
                        })}
                        widget={fromJS(woocommerceDataWidget)}
                        source={woocommerceDataSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should start widget edit on customize widget button click', () => {
        const {getByText} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <Wrapper
                        template={fromJS({
                            ...woocommerceDataWidget.template,
                            templatePath: defaultTemplatePath,
                            absolutePath: defaultAbsolutePath,
                        })}
                        widget={fromJS(woocommerceDataWidget)}
                        source={woocommerceDataSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        fireEvent.click(getByText(CUSTOMIZE_WIDGET_BUTTON_TEXT))

        expect(store.getActions()).toContainEqual(
            actions.startWidgetEdition(defaultTemplatePath)
        )
    })

    it('should pass the template color to edit form', () => {
        const color = '#ff0000'
        const {getByText, getByTestId} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <Wrapper
                        template={fromJS({
                            ...woocommerceDataWidget.template,
                            templatePath: defaultTemplatePath,
                            absolutePath: defaultAbsolutePath,
                            meta: {
                                color,
                            },
                        })}
                        widget={fromJS(woocommerceDataWidget)}
                        source={woocommerceDataSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        fireEvent.click(getByText(CUSTOMIZE_WIDGET_BUTTON_TEXT))

        expect(getByTestId(MOCK_EDIT_FORM_COLOR_ID)).toHaveTextContent(color)
    })

    it('should stop widget edit on form edit cancel', () => {
        const {getByText} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <Wrapper
                        template={fromJS({
                            ...woocommerceDataWidget.template,
                            templatePath: defaultTemplatePath,
                            absolutePath: defaultAbsolutePath,
                        })}
                        widget={fromJS(woocommerceDataWidget)}
                        source={woocommerceDataSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        fireEvent.click(getByText(CUSTOMIZE_WIDGET_BUTTON_TEXT))
        WrapperEditFormMock.mock.calls.slice(-1)[0][0].onCancel()

        expect(store.getActions()).toContainEqual(actions.stopWidgetEdition())
    })

    it('should update widget and stop widget edit on form edit submit', () => {
        const expectedData: FormData = {
            color: '#abcdef',
        }
        const {getByText} = render(
            <Provider store={store}>
                <EditionContext.Provider value={{isEditing: true}}>
                    <Wrapper
                        template={fromJS({
                            ...woocommerceDataWidget.template,
                            templatePath: defaultTemplatePath,
                            absolutePath: defaultAbsolutePath,
                        })}
                        widget={fromJS(woocommerceDataWidget)}
                        source={woocommerceDataSource}
                    />
                </EditionContext.Provider>
            </Provider>
        )

        fireEvent.click(getByText(CUSTOMIZE_WIDGET_BUTTON_TEXT))
        WrapperEditFormMock.mock.calls.slice(-1)[0][0].onSubmit(expectedData)

        const storeActions = store.getActions()
        const stopEditAction = actions.stopWidgetEdition()
        expect(storeActions).toContainEqual(stopEditAction)

        const updateAction = actions.updateEditedWidget({
            type: 'wrapper',
            meta: {
                color: expectedData.color,
            },
        })
        expect(storeActions).toContainEqual(updateAction)

        expect(
            storeActions.findIndex(
                ({type}: Action) => type === updateAction.type
            )
        ).toBeLessThan(
            storeActions.findIndex(
                ({type}: Action) => type === stopEditAction.type
            )
        )
    })
})

const wrapper = ({children}: {children: ReactNode}) => (
    <Provider store={store}>{children}</Provider>
)

describe('useIntegration hook', () => {
    it('should return the integration extracted from the absolute path', () => {
        const absolutePath = ['a', 'b', 'c', '2']
        const widgetType = IntegrationType.Shopify
        const integrationId = 0
        const {result} = renderHook(
            () => useIntegration(absolutePath, widgetType, integrationId),
            {wrapper}
        )
        expect(result.current).toEqual(
            fromJS({
                id: 2,
                type: 'shopify',
                name: 'my little shopify integration',
            })
        )
    })

    it('should return the integration extracted from the integration id', () => {
        const absolutePath = [
            'a',
            'b',
            'c',
            'd9c28d74-683b-11ee-8c99-0242ac120002',
        ]
        const widgetType = IntegrationType.Shopify
        const integrationId = 2
        const {result} = renderHook(
            () => useIntegration(absolutePath, widgetType, integrationId),
            {wrapper}
        )
        expect(result.current).toEqual(
            fromJS({
                id: 2,
                type: 'shopify',
                name: 'my little shopify integration',
            })
        )
    })
})
