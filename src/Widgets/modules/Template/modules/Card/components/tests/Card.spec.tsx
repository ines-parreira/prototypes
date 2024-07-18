import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {Action} from 'redux'
import {fromJS} from 'immutable'
import {act, render, screen} from '@testing-library/react'

import {assumeMock, getLastMockCall} from 'utils/testing'
import {cardTemplate, listTemplate, shopifyWidget} from 'fixtures/widgets'
import {RootState} from 'state/types'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import {renderTemplate} from 'pages/common/utils/template'
import {renderInfobarTemplate} from 'pages/common/utils/infobar'
import CustomActions from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions'
import {Button as ButtonType} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import {getWidgetTitle} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'
import {CardTemplate, ListTemplate} from 'models/widget/types'

import {WidgetContext} from 'Widgets/contexts/WidgetContext'
import {DEFAULT_LIST_ITEM_DISPLAYED_NUMBER} from 'Widgets/modules/Template/config/template'

import * as isDefaultOpenExports from '../../helpers/isDefaultOpen'
import {canDrop} from '../../helpers/canDrop'
import Card, {listMetaFields, NO_DATA_TEXT} from '../../components/Card'
import UICard from '../../components/views'
import {CardEditFormState} from '../../types'

const CHILDREN_TEST_ID = 'childrennnn'

const mockStore = configureMockStore()

jest.mock('../../helpers/canDrop', () => ({
    canDrop: jest.fn(() => true),
}))

jest.mock('pages/common/utils/template')
jest.mock('pages/common/utils/infobar')
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/helpers'
)
const canDropMock = assumeMock(canDrop)
const renderTemplateMock = assumeMock(renderTemplate)
const renderInfobarTemplateMock = assumeMock(renderInfobarTemplate)
const getWidgetTitleMock = assumeMock(getWidgetTitle)

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions',
    () => jest.fn(() => <div>CustomActions</div>)
)
jest.spyOn(isDefaultOpenExports, 'isDefaultOpen')

const CustomActionsMock = assumeMock(CustomActions)

const UICARD_TEST_ID = 'ui-card'
jest.mock('../../components/views', () =>
    jest.fn(
        ({
            extensions,
            customActions,
            children,
        }: ComponentProps<typeof UICard>) => {
            return (
                <>
                    <span data-testid={UICARD_TEST_ID}>
                        {Object.values(extensions).map((extension, index) => (
                            <div key={index}>
                                {typeof extension === 'function'
                                    ? extension('ok')
                                    : extension}
                            </div>
                        ))}
                        {customActions}
                        {children}
                    </span>
                </>
            )
        }
    )
)
const UICardMock = assumeMock(UICard)

describe('Card', () => {
    const defaultState = {
        widgets: fromJS({
            _internal: {
                currentlyEditedWidgetPath: '',
            },
        }),
    } as RootState
    const defaultParentAbsolutePath = ['foo']
    const defaultParentTemplate = {
        ...listTemplate,
        absolutePath: defaultParentAbsolutePath,
    }
    const defaultAbsolutePath = ['foo', 'bar']
    const defaultTemplate = {...cardTemplate, absolutePath: defaultAbsolutePath}
    const defaultProps: ComponentProps<typeof Card> = {
        extensions: {},
        parentTemplate: defaultParentTemplate,
        template: defaultTemplate,
        isEditing: false,
        source: {yes: 'sure thing'},
        children: <div>{CHILDREN_TEST_ID}</div>,
        isFirstOfList: true,
    }

    const legacyProps = {
        template: fromJS(defaultProps.template),
        source: fromJS(defaultProps.source),
        isEditing: defaultProps.isEditing,
    }

    describe('getCardTitle', () => {
        it('should call "getWidgetTitle" if root widget', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} />
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(getWidgetTitleMock).toHaveBeenCalledTimes(1)
        })

        it("should not call 'getWidgetTitle' if not root widget", () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card
                            {...defaultProps}
                            template={
                                {
                                    templatePath:
                                        '0.template.widgets.0.something',
                                } as CardTemplate
                            }
                        />
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(getWidgetTitleMock).not.toHaveBeenCalled()
        })
    })

    describe('children rendering', () => {
        it('should say it when there is no data to display', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} source={undefined} />
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(screen.getByText(NO_DATA_TEXT))
        })

        it('should render children', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} />
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(screen.queryByText(CHILDREN_TEST_ID))
        })
    })

    describe('UICard params', () => {
        it('should provide templated title', () => {
            const defaultTitle = defaultProps.template.title || ''
            const title = 'wohhh?'
            getWidgetTitleMock.mockReturnValue(defaultTitle)
            renderTemplateMock.mockReturnValue(defaultTitle)
            renderInfobarTemplateMock.mockReturnValue(title)
            render(
                <Provider store={mockStore(defaultState)}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} />
                    </WidgetContext.Provider>
                </Provider>
            )
            expect(renderInfobarTemplateMock).toHaveBeenNthCalledWith(
                1,
                defaultTitle,
                defaultProps.source
            )

            expect(getLastMockCall(UICardMock)[0].displayedTitle).toBe(title)
        })

        it('should provide template link', () => {
            const link = 'wohhh?'
            renderTemplateMock.mockReturnValue(link)
            render(
                <Provider store={mockStore(defaultState)}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} />
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(renderTemplateMock).toHaveBeenNthCalledWith(
                1,
                defaultProps.template.meta?.link || '',
                defaultProps.source
            )
            expect(getLastMockCall(UICardMock)[0].dynamicLink).toBe(link)
        })

        it('should provide isDefaultOpen', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} />
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(isDefaultOpenExports.isDefaultOpen).toHaveBeenCalledWith({
                isEditing: false,
                parentTemplate: defaultParentTemplate,
                isFirstOfList: true,
            })
            expect(getLastMockCall(UICardMock)[0].isDefaultOpen).toBe(true)
        })

        it('should provide isEditionMode if isEditing', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} isEditing />
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(getLastMockCall(UICardMock)[0].isEditionMode).toBe(true)
        })

        it('should provide isDraggable to false if its parent is a list', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} />
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(getLastMockCall(UICardMock)[0].isDraggable).toBe(false)
        })

        it('should provide cardData', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} />
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(getLastMockCall(UICardMock)[0].cardData).toEqual({
                color: defaultProps.template.meta?.color || '',
                displayCard: defaultProps.template.meta?.displayCard,
                limit: Number(
                    (defaultProps.parentTemplate as ListTemplate).meta?.limit ||
                        DEFAULT_LIST_ITEM_DISPLAYED_NUMBER
                ),
                link: defaultProps.template.meta?.link || '',
                orderBy:
                    (defaultProps.parentTemplate as ListTemplate).meta
                        ?.orderBy || '',
                pictureUrl: defaultProps.template.meta?.pictureUrl || '',
                title: defaultProps.template.title || '',
            })
        })

        it('should default to true if displayCard is not set', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card
                            {...defaultProps}
                            template={{
                                ...defaultProps.template,
                                meta: {
                                    ...(defaultProps.template.meta || {}),
                                    displayCard: undefined,
                                },
                            }}
                        />
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(getLastMockCall(UICardMock)[0].cardData.displayCard).toBe(
                true
            )
        })

        it('should provide the correct orderByOptions', () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} isEditing />
                    </WidgetContext.Provider>
                </Provider>
            )

            expect(getLastMockCall(UICardMock)[0].orderByOptions).toEqual([
                {label: 'Id (DESC)', value: '-id'},
                {label: 'Id (ASC)', value: '+id'},
                {label: 'Created at (DESC)', value: '-created_at'},
                {label: 'Created at (ASC)', value: '+created_at'},
            ])
        })

        describe('canDrop', () => {
            it("should set canDrop to true if canDrop() returns true and it's in edition mode", () => {
                canDropMock.mockReturnValue(true)
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card {...defaultProps} isEditing />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(getLastMockCall(UICardMock)[0].canDrop).toBe(true)
            })
            it('should set canDrop to false if not editing', () => {
                canDropMock.mockReturnValue(true)
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card {...defaultProps} />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(getLastMockCall(UICardMock)[0].canDrop).toBe(false)
            })
        })

        describe('shouldDisplayHeader', () => {
            it('should not display header if displayCard is false', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card
                                {...defaultProps}
                                template={{
                                    ...defaultProps.template,
                                    meta: {
                                        displayCard: false,
                                    },
                                }}
                            />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(getLastMockCall(UICardMock)[0].shouldDisplayHeader).toBe(
                    false
                )
            })

            it('should display header in edition mode even if displayCard is false', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card
                                {...defaultProps}
                                template={{
                                    ...defaultProps.template,
                                    meta: {
                                        displayCard: false,
                                    },
                                }}
                                isEditing
                            />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(getLastMockCall(UICardMock)[0].shouldDisplayHeader).toBe(
                    true
                )
            })

            it('should display header if they are some custom actions and title is empty', () => {
                getWidgetTitleMock.mockReturnValue('')
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card
                                {...defaultProps}
                                template={{
                                    ...defaultProps.template,
                                    title: '',
                                    meta: {
                                        custom: {
                                            buttons: [
                                                {
                                                    label: 'ok',
                                                } as ButtonType,
                                            ],
                                        },
                                    },
                                }}
                            />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(getLastMockCall(UICardMock)[0].shouldDisplayHeader).toBe(
                    true
                )
            })
        })

        describe('shouldDisplayContent ', () => {
            it('should display content if in edition mode', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card
                                {...defaultProps}
                                isEditing
                                source={undefined}
                            />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(
                    getLastMockCall(UICardMock)[0].shouldDisplayContent
                ).toBe(true)
                expect(screen.getByText(NO_DATA_TEXT))
            })

            it('should display content if there is data to display', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card {...defaultProps} />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(
                    getLastMockCall(UICardMock)[0].shouldDisplayContent
                ).toBe(true)
                expect(screen.getByText(CHILDREN_TEST_ID))
            })

            it('should not display content if there is no data', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card
                                {...defaultProps}
                                template={{
                                    ...defaultProps.template,
                                    widgets: [],
                                }}
                            />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(
                    getLastMockCall(UICardMock)[0].shouldDisplayContent
                ).toBe(false)
                expect(screen.queryByText(CHILDREN_TEST_ID)).toBeNull()
            })
        })

        describe('customActions', () => {
            it('should not provide custom actions if widget is not root widget', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card
                                {...defaultProps}
                                template={
                                    {
                                        templatePath:
                                            '0.template.widgets.0.something',
                                    } as CardTemplate
                                }
                            />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(getLastMockCall(UICardMock)[0].customActions).toBeNull()
            })

            it('should provide custom actions if widget is root widget', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card {...defaultProps} />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(
                    getLastMockCall(UICardMock)[0].customActions
                ).not.toBeNull()

                expect(CustomActionsMock).toHaveBeenNthCalledWith(
                    1,
                    {
                        isEditing: false,
                        template: defaultProps.template,
                        source: defaultProps.source,
                    },
                    {}
                )
            })
        })

        describe('editionHiddenFields', () => {
            it('should hide fields relative to list in the edit form', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card
                                {...defaultProps}
                                parentTemplate={undefined}
                                isEditing
                            />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(
                    getLastMockCall(UICardMock)[0].editionHiddenFields
                ).toEqual(listMetaFields)
            })

            it('should not hide fields relative to list in the edit form', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card {...defaultProps} isEditing />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(
                    getLastMockCall(UICardMock)[0].editionHiddenFields
                ).not.toEqual(listMetaFields)
            })

            it('should add "pictureUrl" and "color" to hidden fields if there is a TitleWrapper and integration type is not http', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card
                                {...defaultProps}
                                extensions={{
                                    TitleWrapper: () => <div>TitleWrapper</div>,
                                }}
                            />
                        </WidgetContext.Provider>
                    </Provider>
                )

                expect(
                    getLastMockCall(UICardMock)[0].editionHiddenFields
                ).toEqual(expect.arrayContaining(['pictureUrl', 'color']))
            })
        })

        describe('extensions', () => {
            it('should handle extensions when they are not provided', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card {...defaultProps} />
                        </WidgetContext.Provider>
                    </Provider>
                )

                const mappedExtensions =
                    getLastMockCall(UICardMock)[0].extensions

                expect(mappedExtensions.afterTitle).toBeUndefined()
                expect(mappedExtensions.beforeContent).toBeUndefined()
                expect(mappedExtensions.afterContent).toBeUndefined()
                expect(mappedExtensions.renderTitleWrapper(null)).toBeNull()
                expect(mappedExtensions.renderWrapper(null)).toBeNull()
            })

            it('should handle extensions when they are provided', () => {
                const extensions = {
                    AfterTitle: jest.fn(() => <div>AfterTitle</div>),
                    BeforeContent: jest.fn(() => <div>BeforeContent</div>),
                    AfterContent: jest.fn(() => <div>AfterContent</div>),
                    TitleWrapper: jest.fn(() => <div>TitleWrapper</div>),
                    Wrapper: jest.fn(() => <div>Wrapper</div>),
                }
                render(
                    <Provider store={mockStore(defaultState)}>
                        <WidgetContext.Provider value={shopifyWidget}>
                            <Card {...defaultProps} extensions={extensions} />
                        </WidgetContext.Provider>
                    </Provider>
                )

                const mappedExtensions =
                    getLastMockCall(UICardMock)[0].extensions

                expect(mappedExtensions).toHaveProperty('afterTitle')
                expect(mappedExtensions).toHaveProperty('beforeContent')
                expect(mappedExtensions).toHaveProperty('afterContent')
                expect(mappedExtensions).toHaveProperty('renderTitleWrapper')
                expect(mappedExtensions).toHaveProperty('renderWrapper')
                expect(extensions.AfterTitle).toHaveBeenCalledWith(
                    legacyProps,
                    {}
                )
                expect(extensions.BeforeContent).toHaveBeenCalledWith(
                    legacyProps,
                    {}
                )
                expect(extensions.AfterContent).toHaveBeenCalledWith(
                    legacyProps,
                    {}
                )
                expect(extensions.TitleWrapper).toHaveBeenCalledWith(
                    expect.objectContaining(legacyProps),
                    {}
                )
                expect(extensions.Wrapper).toHaveBeenCalledWith(
                    expect.objectContaining(legacyProps),
                    {}
                )
            })
        })
    })

    describe('dispatch callbacks', () => {
        it('should dispatch start widget edition with correct path when calling "onEditionStart"', () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} parentTemplate={undefined} />
                    </WidgetContext.Provider>
                </Provider>
            )

            act(() => getLastMockCall(UICardMock)[0].onEditionStart())

            expect(store.getActions()).toContainEqual(
                startWidgetEdition(cardTemplate.templatePath!)
            )
        })

        it('should dispatch start widget edition with correct path when calling "onEditionStart" when parent is list', () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} />
                    </WidgetContext.Provider>
                </Provider>
            )

            act(() => getLastMockCall(UICardMock)[0].onEditionStart())

            expect(store.getActions()).toContainEqual(
                startWidgetEdition(listTemplate.templatePath!)
            )
        })

        it('should dispatch delete widget action with correct path when calling "onDelete"', () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} parentTemplate={undefined} />
                    </WidgetContext.Provider>
                </Provider>
            )

            act(() => getLastMockCall(UICardMock)[0].onDelete())

            expect(store.getActions()).toContainEqual(
                removeEditedWidget(
                    cardTemplate.templatePath,
                    defaultAbsolutePath
                )
            )
        })

        it('should dispatch delete widget action with correct path when calling "onDelete" when parent is list', () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} />
                    </WidgetContext.Provider>
                </Provider>
            )

            act(() => getLastMockCall(UICardMock)[0].onDelete())

            expect(store.getActions()).toContainEqual(
                removeEditedWidget(
                    cardTemplate.templatePath,
                    defaultParentAbsolutePath
                )
            )
        })

        it('should dispatch update widget action with correct path when calling "onEditionStop"', () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} isEditing />
                    </WidgetContext.Provider>
                </Provider>
            )

            act(() => getLastMockCall(UICardMock)[0].onEditionStop())

            expect(store.getActions()).toContainEqual(stopWidgetEdition())
        })

        it('should dispatch update widget and stop edit when calling "onSubmit"', () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card
                            {...defaultProps}
                            isEditing
                            parentTemplate={undefined}
                        />
                    </WidgetContext.Provider>
                </Provider>
            )

            act(() => {
                UICardMock.mock.calls
                    .slice(-1)[0][0]
                    .onSubmit({title: 'ok'} as CardEditFormState)
            })

            const updateWidgetAction = updateEditedWidget({
                type: 'card',
                title: 'ok',
            })
            const stopEditAction = stopWidgetEdition()
            const actions = store.getActions()

            expect(actions).toContainEqual(updateWidgetAction)
            expect(actions).toContainEqual(stopEditAction)
            expect(
                actions.findIndex(
                    ({type}: Action) => type === updateWidgetAction.type
                )
            ).toBeLessThan(
                actions.findIndex(
                    ({type}: Action) => type === stopEditAction.type
                )
            )
        })

        it('should correctly format given data and provide it to update widget actions', () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card
                            {...defaultProps}
                            isEditing
                            parentTemplate={undefined}
                        />
                    </WidgetContext.Provider>
                </Provider>
            )

            act(() => {
                getLastMockCall(UICardMock)[0].onSubmit({
                    title: 'ok',
                    link: 'http://example.com',
                    pictureUrl: 'http://example.com/picture.jpg',
                    color: 'red',
                    displayCard: true,
                    // make sure these are not taken into account
                    limit: 5,
                    orderBy: 'name',
                })
            })

            const updateWidgetAction = updateEditedWidget({
                type: 'card',
                title: 'ok',
                meta: {
                    link: 'http://example.com',
                    pictureUrl: 'http://example.com/picture.jpg',
                    color: 'red',
                    displayCard: true,
                },
            })

            expect(store.getActions()).toContainEqual(updateWidgetAction)
        })

        it('should correctly format given data and provide it to update widget actions when parent is list', () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <WidgetContext.Provider value={shopifyWidget}>
                        <Card {...defaultProps} isEditing />
                    </WidgetContext.Provider>
                </Provider>
            )

            act(() => {
                getLastMockCall(UICardMock)[0].onSubmit({
                    title: 'ok',
                    link: 'http://example.com',
                    pictureUrl: 'http://example.com/picture.jpg',
                    color: 'red',
                    displayCard: true,
                    limit: 5,
                    orderBy: 'name',
                })
            })

            const updateWidgetAction = updateEditedWidget({
                type: 'list',
                meta: {
                    limit: 5,
                    orderBy: 'name',
                },
                widgets: [
                    {
                        type: 'card',
                        title: 'ok',
                        meta: {
                            link: 'http://example.com',
                            pictureUrl: 'http://example.com/picture.jpg',
                            color: 'red',
                            displayCard: true,
                        },
                    },
                ],
            })

            expect(store.getActions()).toContainEqual(updateWidgetAction)
        })
    })
})
