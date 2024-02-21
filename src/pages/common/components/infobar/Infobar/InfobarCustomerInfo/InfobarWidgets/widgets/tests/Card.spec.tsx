import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {Action} from 'redux'
import {Map, fromJS} from 'immutable'
import {act, screen, fireEvent, render, waitFor} from '@testing-library/react'

import {assumeMock, getLastMockCall} from 'utils/testing'
import {cardTemplate, listTemplate, shopifyWidget} from 'fixtures/widgets'
import {RootState} from 'state/types'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import CardEditForm from 'infobar/ui/CardEditForm'

import Card, {
    DELETE_BUTTON_TEXT,
    EDIT_BUTTON_TEXT,
    listMetaFields,
} from '../Card'

const mockStore = configureMockStore()

const CARD_EDIT_FORM_TEST_ID = 'card-edit-form'
jest.mock('infobar/ui/CardEditForm', () =>
    jest.fn(() => {
        return <span data-testid={CARD_EDIT_FORM_TEST_ID}>card edit form</span>
    })
)
const CardEditFormMock = assumeMock(CardEditForm)

describe('Card', () => {
    const defaultState = {
        widgets: fromJS({
            _internal: {
                currentlyEditedWidgetPath: '',
            },
        }),
    } as RootState
    const defaultParentAbsolutePath = ['foo']
    const defaultParentTemplate = (fromJS(listTemplate) as Map<any, any>).set(
        'absolutePath',
        defaultParentAbsolutePath
    )
    const defaultAbsolutePath = ['foo', 'bar']
    const defaultTemplate = (fromJS(cardTemplate) as Map<any, any>).set(
        'absolutePath',
        defaultAbsolutePath
    )
    const defaultProps: ComponentProps<typeof Card> = {
        // we will add a default source at some point here
        parent: defaultParentTemplate,
        template: defaultTemplate,
        isEditing: false,
        widget: fromJS(shopifyWidget),
        isParentList: false,
        removeBorderTop: false,
        open: true,
    }

    describe('Edit mode', () => {
        it('should have a draggable class', () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <Card {...defaultProps} isEditing />
                </Provider>
            )

            expect(container.firstChild).toHaveClass('draggable')
        })

        it('should set hidden fields relative to list in the edit form', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <Card {...defaultProps} isEditing />
                </Provider>
            )

            act(() => {
                fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))
            })

            expect(getLastMockCall(CardEditFormMock)[0].hiddenFields).toEqual(
                listMetaFields
            )
        })

        it('should render edit and delete buttons when editing', () => {
            const {queryByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <Card {...defaultProps} isEditing />
                </Provider>
            )

            expect(queryByText(EDIT_BUTTON_TEXT)).toBeInTheDocument()
            expect(queryByText(DELETE_BUTTON_TEXT)).toBeInTheDocument()
        })

        it('should dispatch start widget edition with correct path on edit button click', () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <Card {...defaultProps} isEditing />
                </Provider>
            )

            fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))

            expect(store.getActions()).toContainEqual(
                startWidgetEdition(cardTemplate.templatePath!)
            )
        })

        it('should dispatch delete widget action with correct path on delete button click', () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <Card {...defaultProps} isEditing />
                </Provider>
            )

            fireEvent.click(screen.getByText(DELETE_BUTTON_TEXT))

            expect(store.getActions()).toContainEqual(
                removeEditedWidget(
                    cardTemplate.templatePath,
                    defaultAbsolutePath
                )
            )
        })

        it('should display edit form on edit button click', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <Card {...defaultProps} isEditing />
                </Provider>
            )

            fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))

            expect(
                screen.queryByTestId(CARD_EDIT_FORM_TEST_ID)
            ).toBeInTheDocument()
        })

        it('should hide edit form and dispatch stop widget edit on onCancel callback', async () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <Card {...defaultProps} isEditing />
                </Provider>
            )

            fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))
            act(() => getLastMockCall(CardEditFormMock)[0].onCancel())

            await waitFor(() =>
                expect(
                    screen.queryByTestId(CARD_EDIT_FORM_TEST_ID)
                ).not.toBeInTheDocument()
            )
            expect(store.getActions()).toContainEqual(stopWidgetEdition())
        })

        it('should hide edit form, dispatch update widget and stop edit on onSubmit callback', async () => {
            const store = mockStore(defaultState)
            render(
                <Provider store={store}>
                    <Card {...defaultProps} isEditing />
                </Provider>
            )

            act(() => {
                fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))
            })
            act(() => {
                CardEditFormMock.mock.calls
                    .slice(-1)[0][0]
                    .onSubmit({title: 'ok'})
            })

            await waitFor(() =>
                expect(
                    screen.queryByTestId(CARD_EDIT_FORM_TEST_ID)
                ).not.toBeInTheDocument()
            )

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
                    <Card {...defaultProps} isEditing />
                </Provider>
            )

            act(() => {
                fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))
            })
            act(() => {
                getLastMockCall(CardEditFormMock)[0].onSubmit({
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

        it('should hide edit form and dispatch stop widget on click outside of the popover', async () => {
            const store = mockStore(defaultState)
            const {container} = render(
                <Provider store={store}>
                    <Card {...defaultProps} isEditing />
                </Provider>
            )

            act(() => {
                fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))
            })

            fireEvent.click(container)

            await waitFor(() =>
                expect(
                    screen.queryByTestId(CARD_EDIT_FORM_TEST_ID)
                ).not.toBeInTheDocument()
            )
            expect(store.getActions()).toContainEqual(stopWidgetEdition())
        })

        describe('Parent is list', () => {
            it('should have a draggable class', () => {
                const {container} = render(
                    <Provider store={mockStore(defaultState)}>
                        <Card {...defaultProps} isEditing isParentList />
                    </Provider>
                )

                expect(container.firstChild).not.toHaveClass('draggable')
            })

            it('should set no hidden fields in the edit form', () => {
                render(
                    <Provider store={mockStore(defaultState)}>
                        <Card {...defaultProps} isEditing isParentList />
                    </Provider>
                )

                fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))
                act(() => {
                    expect(
                        screen.queryByTestId(CARD_EDIT_FORM_TEST_ID)
                    ).toBeInTheDocument()
                })

                expect(
                    getLastMockCall(CardEditFormMock)[0].orderByOptions
                ).not.toEqual(listMetaFields)
            })

            it('should dispatch start widget edition with correct path on edit button click', () => {
                const store = mockStore(defaultState)
                render(
                    <Provider store={store}>
                        <Card
                            {...defaultProps}
                            isEditing
                            parent={fromJS(listTemplate)}
                            isParentList
                        />
                    </Provider>
                )

                fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))

                expect(store.getActions()).toContainEqual(
                    startWidgetEdition(listTemplate.templatePath!)
                )
            })

            it('should dispatch delete widget action with correct path on delete button click', () => {
                const store = mockStore(defaultState)
                render(
                    <Provider store={store}>
                        <Card {...defaultProps} isEditing isParentList />
                    </Provider>
                )

                fireEvent.click(screen.getByText(DELETE_BUTTON_TEXT))

                expect(store.getActions()).toContainEqual(
                    removeEditedWidget(
                        cardTemplate.templatePath,
                        defaultParentAbsolutePath
                    )
                )
            })

            it('should correctly format given data and provide it to update widget actions', () => {
                const store = mockStore(defaultState)
                render(
                    <Provider store={store}>
                        <Card {...defaultProps} isEditing isParentList />
                    </Provider>
                )

                act(() => {
                    fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))
                })
                act(() => {
                    getLastMockCall(CardEditFormMock)[0].onSubmit({
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

            it('should provide the correct orderBy parameter to the edit form', () => {
                const store = mockStore(defaultState)
                render(
                    <Provider store={store}>
                        <Card {...defaultProps} isEditing isParentList />
                    </Provider>
                )

                act(() => {
                    fireEvent.click(screen.getByText(EDIT_BUTTON_TEXT))
                })

                expect(
                    getLastMockCall(CardEditFormMock)[0].orderByOptions
                ).toEqual([
                    {label: 'Id (DESC)', value: '-id'},
                    {label: 'Id (ASC)', value: '+id'},
                    {label: 'Created at (DESC)', value: '-created_at'},
                    {label: 'Created at (ASC)', value: '+created_at'},
                ])
            })
        })
    })
})
