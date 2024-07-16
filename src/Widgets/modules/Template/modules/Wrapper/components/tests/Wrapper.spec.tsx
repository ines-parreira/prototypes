import React, {ComponentProps, ReactNode} from 'react'
import {screen, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Action} from 'redux'

import {renderHook} from '@testing-library/react-hooks'
import {EditionContext} from 'providers/infobar/EditionContext'
import {IntegrationType} from 'models/integration/types'
import {WrapperTemplate} from 'models/widget/types'
import * as actions from 'state/widgets/actions'
import {Widget, WidgetType} from 'state/widgets/types'
import {
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    THIRD_PARTY_APP_NAME_KEY,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'
import {assumeMock, getLastMockCall} from 'utils/testing'

import {WidgetContext} from 'Widgets/contexts/WidgetContext'

import WrapperEditActions, {FormData} from '../views/WrapperEditActions'

import Wrapper, {CUSTOMIZABLE_WIDGET_TYPES, useIntegration} from '../Wrapper'

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

const wrapperTemplate = {
    type: 'wrapper',
    widgets: [],
} as WrapperTemplate

const shopifyWidget = {
    id: 4,
    type: IntegrationType.Shopify,
    integration_id: 2,
    template: wrapperTemplate,
    order: 1,
} as Widget

const shopifySource = {foo: 'foo value'}

const httpWidget = {
    id: 5,
    type: IntegrationType.Http,
    integration_id: 1,
    template: wrapperTemplate,
    order: 2,
} as Widget

const httpSource = {bar: 'bar value'}

const customerExternalDataWidget = {
    id: 6,
    type: CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    app_id: '5dfgsadsasad',
    template: wrapperTemplate,
    order: 3,
} as Widget

const customerExternalDataSource = {
    bar: 'bar value',
    [THIRD_PARTY_APP_NAME_KEY]: 'my-wonderful-app-name',
}

const woocommerceDataWidget = {
    id: 6,
    type: WOOCOMMERCE_WIDGET_TYPE,
    integration_id: 3,
    template: wrapperTemplate,
    order: 3,
} as Widget

const woocommerceDataSource = {
    foo: 'bar',
    store: {
        helpdesk_integration_id: 3,
    },
}

const MOCK_EDIT_FORM_COLOR_ID = 'edit-form-color'
jest.mock('../views/WrapperEditActions', () =>
    jest.fn((props: ComponentProps<typeof WrapperEditActions>) => (
        <div>
            <span data-testid={MOCK_EDIT_FORM_COLOR_ID}>
                {props.initialData?.color}
            </span>
        </div>
    ))
)
const WrapperEditActionsMock = assumeMock(WrapperEditActions)

describe('Wrapper', () => {
    const defaultTemplatePath = 'templatePath'
    const defaultAbsolutePath = ['absolute', 'path']

    beforeEach(() => {
        store.clearActions()
    })

    it('should display (without an edit or a remove icon)', () => {
        const {container} = render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <EditionContext.Provider value={{isEditing: false}}>
                        <Wrapper
                            template={{
                                ...wrapperTemplate,
                                templatePath: defaultTemplatePath,
                                absolutePath: defaultAbsolutePath,
                            }}
                            source={shopifySource}
                        >
                            {'foo'}
                        </Wrapper>
                    </EditionContext.Provider>
                </WidgetContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should call the removeEditedWidget action on delete edit action', () => {
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <EditionContext.Provider value={{isEditing: true}}>
                        <Wrapper
                            template={{
                                ...wrapperTemplate,
                                templatePath: defaultTemplatePath,
                                absolutePath: defaultAbsolutePath,
                            }}
                            source={httpSource}
                        >
                            {'foo'}
                        </Wrapper>
                    </EditionContext.Provider>
                </WidgetContext.Provider>
            </Provider>
        )

        getLastMockCall(WrapperEditActionsMock)[0].onDelete()

        expect(store.getActions()).toContainEqual(
            removeEditedWidget(defaultTemplatePath, defaultAbsolutePath)
        )
    })

    it.each(CUSTOMIZABLE_WIDGET_TYPES)(
        'should render color for customizable "%s" widget type',
        (type) => {
            const color = '#fff'
            const {getByTestId} = render(
                <Provider store={store}>
                    <WidgetContext.Provider
                        value={{...httpWidget, type: type as WidgetType}}
                    >
                        <EditionContext.Provider value={{isEditing: true}}>
                            <Wrapper
                                template={{
                                    ...wrapperTemplate,
                                    meta: {
                                        color,
                                    },
                                    templatePath: defaultTemplatePath,
                                    absolutePath: defaultAbsolutePath,
                                }}
                                source={shopifySource}
                            >
                                {'foo'}
                            </Wrapper>
                        </EditionContext.Provider>
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(getByTestId(MOCK_EDIT_FORM_COLOR_ID)).toHaveTextContent(
                color
            )
        }
    )

    it('should not render color for not-customizable widget type', () => {
        const color = '#fff'
        const {getByTestId} = render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <EditionContext.Provider value={{isEditing: true}}>
                        <Wrapper
                            template={{
                                ...wrapperTemplate,
                                meta: {
                                    color,
                                },
                                templatePath: defaultTemplatePath,
                                absolutePath: defaultAbsolutePath,
                            }}
                            source={shopifySource}
                        >
                            {'foo'}
                        </Wrapper>
                    </EditionContext.Provider>
                </WidgetContext.Provider>
            </Provider>
        )

        expect(getByTestId(MOCK_EDIT_FORM_COLOR_ID)).not.toHaveTextContent(
            color
        )
    })

    it('should render customer external data widget with the proper id', () => {
        const {container} = render(
            <Provider store={store}>
                <WidgetContext.Provider value={customerExternalDataWidget}>
                    <EditionContext.Provider value={{isEditing: false}}>
                        <Wrapper
                            template={{
                                ...wrapperTemplate,
                                templatePath: defaultTemplatePath,
                                absolutePath: defaultAbsolutePath,
                            }}
                            source={customerExternalDataSource}
                        >
                            {'foo'}
                        </Wrapper>
                    </EditionContext.Provider>
                </WidgetContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render woocommerce widget with the proper id', () => {
        const {container} = render(
            <Provider store={store}>
                <WidgetContext.Provider value={woocommerceDataWidget}>
                    <EditionContext.Provider value={{isEditing: false}}>
                        <Wrapper
                            template={{
                                ...wrapperTemplate,
                                templatePath: defaultTemplatePath,
                                absolutePath: defaultAbsolutePath,
                            }}
                            source={woocommerceDataSource}
                        >
                            {'foo'}
                        </Wrapper>
                    </EditionContext.Provider>
                </WidgetContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should start widget edit on edit start', () => {
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={woocommerceDataWidget}>
                    <EditionContext.Provider value={{isEditing: true}}>
                        <Wrapper
                            template={{
                                ...wrapperTemplate,
                                templatePath: defaultTemplatePath,
                                absolutePath: defaultAbsolutePath,
                            }}
                            source={woocommerceDataSource}
                        >
                            {'foo'}
                        </Wrapper>
                    </EditionContext.Provider>
                </WidgetContext.Provider>
            </Provider>
        )

        getLastMockCall(WrapperEditActionsMock)[0].onEditStart()

        expect(store.getActions()).toContainEqual(
            actions.startWidgetEdition(defaultTemplatePath)
        )
    })

    it('should stop widget edit on edit cancel', () => {
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <EditionContext.Provider value={{isEditing: true}}>
                        <Wrapper
                            template={{
                                ...wrapperTemplate,
                                templatePath: defaultTemplatePath,
                                absolutePath: defaultAbsolutePath,
                            }}
                            source={woocommerceDataSource}
                        >
                            {'foo'}
                        </Wrapper>
                    </EditionContext.Provider>
                </WidgetContext.Provider>
            </Provider>
        )

        getLastMockCall(WrapperEditActionsMock)[0].onEditCancel()

        expect(store.getActions()).toContainEqual(actions.stopWidgetEdition())
    })

    it('should update widget and stop widget edit on form edit submit', () => {
        const expectedData: FormData = {
            color: '#abcdef',
        }
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <EditionContext.Provider value={{isEditing: true}}>
                        <Wrapper
                            template={{
                                ...wrapperTemplate,
                                templatePath: defaultTemplatePath,
                                absolutePath: defaultAbsolutePath,
                            }}
                            source={woocommerceDataSource}
                        >
                            {'foo'}
                        </Wrapper>
                    </EditionContext.Provider>
                </WidgetContext.Provider>
            </Provider>
        )

        WrapperEditActionsMock.mock.calls
            .slice(-1)[0][0]
            .onEditSubmit(expectedData)

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

    it('should render its children', () => {
        render(
            <Provider store={store}>
                <Wrapper template={wrapperTemplate} source={shopifySource}>
                    {'foo'}
                </Wrapper>
            </Provider>
        )
        expect(screen.getByText('foo'))
    })
})

const wrapper = ({children}: {children: ReactNode}) => (
    <Provider store={store}>
        <WidgetContext.Provider value={shopifyWidget}>
            {children}
        </WidgetContext.Provider>
    </Provider>
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
