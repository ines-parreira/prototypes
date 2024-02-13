import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {Action} from 'redux'
import {Map, fromJS} from 'immutable'
import {act, fireEvent, render, waitFor} from '@testing-library/react'

import {assumeMock} from 'utils/testing'
import {PartialTemplate} from 'models/widget/types'
import {idTemplate, shopifyWidget} from 'fixtures/widgets'
import {RootState} from 'state/types'
import {SHOPIFY_WIDGET_TYPE} from 'state/widgets/constants'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'

import Field, {DELETE_BUTTON_TEXT, EDIT_BUTTON_TEXT} from '../Field'
import {Copy} from '../CopyButton'
import FieldEdit from '../forms/FieldEdit'

const mockStore = configureMockStore()

const COPY_BUTTON_TEST_ID = 'copy-button'
jest.mock('../CopyButton', () => ({
    Copy: jest.fn(() => {
        return <span data-testid={COPY_BUTTON_TEST_ID}>copy button</span>
    }),
}))
const CopyMock = assumeMock(Copy)

const FIELD_EDIT_TEST_ID = 'field-edit'
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/forms/FieldEdit',
    () =>
        jest.fn(() => {
            return <span data-testid={FIELD_EDIT_TEST_ID}>field edit</span>
        })
)
const FieldEditMock = assumeMock(FieldEdit)

describe('Field', () => {
    const defaultState = {
        widgets: fromJS({
            _internal: {
                currentlyEditedWidgetPath: '',
            },
        }),
    } as RootState
    const defaultAbsolutePath = ['foo', 'bar']
    const defaultValue = 'foo value'
    const defaultCopyableValue = 'copyable value'
    const defaultProps: ComponentProps<typeof Field> = {
        value: defaultValue,
        template: (fromJS(idTemplate) as Map<any, any>).set(
            'absolutePath',
            defaultAbsolutePath
        ),
        isEditing: false,
        type: SHOPIFY_WIDGET_TYPE,
        widget: fromJS(shopifyWidget),
        copyableValue: defaultCopyableValue,
    }

    it('should render title and value', () => {
        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <Field {...defaultProps} />
            </Provider>
        )

        expect(container.firstChild).toHaveTextContent(
            `${idTemplate.title}:${defaultValue}`
        )
    })

    it('should render copy button when copyable value is defined', () => {
        const {queryByTestId} = render(
            <Provider store={mockStore(defaultState)}>
                <Field {...defaultProps} />
            </Provider>
        )

        expect(queryByTestId(COPY_BUTTON_TEST_ID)).toBeInTheDocument()
        expect(CopyMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                name: idTemplate.title,
                value: defaultCopyableValue,
                onCopyMessage: `${idTemplate.title} copied to clipboard`,
            }),
            expect.anything()
        )
    })

    it('should not render the copy button when editing', () => {
        const {queryByTestId} = render(
            <Provider store={mockStore(defaultState)}>
                <Field {...defaultProps} isEditing />
            </Provider>
        )

        expect(queryByTestId(COPY_BUTTON_TEST_ID)).not.toBeInTheDocument()
    })

    it('should render edit and delete buttons when editing', () => {
        const {queryByText} = render(
            <Provider store={mockStore(defaultState)}>
                <Field {...defaultProps} isEditing />
            </Provider>
        )

        expect(queryByText(EDIT_BUTTON_TEXT)).toBeInTheDocument()
        expect(queryByText(DELETE_BUTTON_TEXT)).toBeInTheDocument()
    })

    it('should dispatch edit widget action on edit button click', () => {
        const store = mockStore(defaultState)
        const {getByText} = render(
            <Provider store={store}>
                <Field {...defaultProps} isEditing />
            </Provider>
        )

        fireEvent.click(getByText(EDIT_BUTTON_TEXT))

        expect(store.getActions()).toContainEqual(
            startWidgetEdition(idTemplate.templatePath!)
        )
    })

    it('should dispatch delete widget action on delete button click', () => {
        const store = mockStore(defaultState)
        const {getByText} = render(
            <Provider store={store}>
                <Field {...defaultProps} isEditing />
            </Provider>
        )

        fireEvent.click(getByText(DELETE_BUTTON_TEXT))

        expect(store.getActions()).toContainEqual(
            removeEditedWidget(idTemplate.templatePath, defaultAbsolutePath)
        )
    })

    it('should display edit form on edit button click', () => {
        const {getByText, queryByTestId} = render(
            <Provider store={mockStore(defaultState)}>
                <Field {...defaultProps} isEditing />
            </Provider>
        )

        fireEvent.click(getByText(EDIT_BUTTON_TEXT))

        expect(queryByTestId(FIELD_EDIT_TEST_ID)).toBeInTheDocument()
    })

    it('should hide edit form and dispatch stop widget edit on onCancel callback', async () => {
        const store = mockStore(defaultState)
        const {getByText, queryByTestId} = render(
            <Provider store={store}>
                <Field {...defaultProps} isEditing />
            </Provider>
        )

        fireEvent.click(getByText(EDIT_BUTTON_TEXT))
        act(() => FieldEditMock.mock.calls.slice(-1)[0][0].onCancel())

        await waitFor(() =>
            expect(queryByTestId(FIELD_EDIT_TEST_ID)).not.toBeInTheDocument()
        )
        expect(store.getActions()).toContainEqual(stopWidgetEdition())
    })

    it('should hide edit form, dispatch update widget and stop edit on onSubmit callback', async () => {
        const partialTemplate: PartialTemplate = {title: 'foo', type: 'url'}
        const store = mockStore(defaultState)
        const {getByText, queryByTestId} = render(
            <Provider store={store}>
                <Field {...defaultProps} isEditing />
            </Provider>
        )

        fireEvent.click(getByText(EDIT_BUTTON_TEXT))
        act(() =>
            FieldEditMock.mock.calls.slice(-1)[0][0].onSubmit(partialTemplate)
        )

        await waitFor(() =>
            expect(queryByTestId(FIELD_EDIT_TEST_ID)).not.toBeInTheDocument()
        )

        const actions = store.getActions()
        const updateWidgetAction = updateEditedWidget(partialTemplate)
        expect(actions).toContainEqual(updateWidgetAction)

        const stopEditAction = stopWidgetEdition()
        expect(actions).toContainEqual(stopEditAction)

        expect(
            actions.findIndex(
                ({type}: Action) => type === updateWidgetAction.type
            )
        ).toBeLessThan(
            actions.findIndex(({type}: Action) => type === stopEditAction.type)
        )
    })

    it('should hide edit form and dispatch stop widget on click outside of the popover', async () => {
        const store = mockStore(defaultState)
        const {getByText, queryByTestId, container} = render(
            <Provider store={store}>
                <Field {...defaultProps} isEditing />
            </Provider>
        )

        fireEvent.click(getByText(EDIT_BUTTON_TEXT))
        fireEvent.click(container)

        await waitFor(() =>
            expect(queryByTestId(FIELD_EDIT_TEST_ID)).not.toBeInTheDocument()
        )
        expect(store.getActions()).toContainEqual(stopWidgetEdition())
    })
})
