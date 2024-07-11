import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {render} from '@testing-library/react'

import {assumeMock, getLastMockCall} from 'utils/testing'
import {idTemplate, shopifyWidget} from 'fixtures/widgets'
import {RootState} from 'state/types'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import CopyButton from 'Widgets/modules/Template/modules/Field/components/CopyButton'
import UIField from 'Widgets/modules/Template/modules/Field/components/views'
import {WidgetContext} from 'Widgets/contexts/WidgetContext'
import {LEAF_TYPES} from 'models/widget/constants'

import Field, {TYPE_OPTIONS} from '../Field'

const mockStore = configureMockStore()

jest.mock('Widgets/modules/Template/modules/Field/components/CopyButton', () =>
    jest.fn(() => <span>copy button</span>)
)
const CopyButtonMock = assumeMock(CopyButton)

jest.mock('Widgets/modules/Template/modules/Field/components/views', () =>
    jest.fn(({copyButton}: {copyButton: React.ReactNode}) => {
        return <span>ui field {copyButton}</span>
    })
)
const UIFieldMock = assumeMock(UIField)

describe('Field', () => {
    const defaultState = {
        widgets: fromJS({
            _internal: {
                currentlyEditedWidgetPath: '',
            },
        }),
    } as RootState
    const defaultAbsolutePath = ['foo', 'bar']
    const defaultTemplate = {...idTemplate, absolutePath: defaultAbsolutePath}

    const defaultProps: ComponentProps<typeof Field> = {
        value: 'foo value',
        type: LEAF_TYPES.TEXT,
        isEditing: false,
        template: defaultTemplate,
        copyableValue: 'copyable value',
    }

    const store = mockStore(defaultState)

    it('should default type to text if type is not an existing leaf type', () => {
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <Field
                        {...defaultProps}
                        type={'someone messed with the API again'}
                    />
                </WidgetContext.Provider>
            </Provider>
        )
        expect(getLastMockCall(UIFieldMock)[0].type).toEqual(LEAF_TYPES.TEXT)
    })

    it('should pass template title, value, type, isEditing to the UI field', () => {
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <Field {...defaultProps} />
                </WidgetContext.Provider>
            </Provider>
        )

        expect(getLastMockCall(UIFieldMock)[0]).toEqual(
            expect.objectContaining({
                title: idTemplate.title,
                value: defaultProps.value,
                type: defaultProps.type,
                isEditionMode: defaultProps.isEditing,
            })
        )
    })

    it('should exclude editable list from type options', () => {
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <Field {...defaultProps} />
                </WidgetContext.Provider>
            </Provider>
        )

        const {availableTypes} = getLastMockCall(UIFieldMock)[0]
        expect(availableTypes).toEqual(
            TYPE_OPTIONS.filter(
                (option) => option.value !== LEAF_TYPES.EDITABLE_LIST
            )
        )
    })

    it('should include editableList in the type options for the tags path of a shopify widget ', () => {
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <Field
                        {...defaultProps}
                        template={{...defaultTemplate, path: 'tags'}}
                    />
                </WidgetContext.Provider>
            </Provider>
        )

        const {availableTypes} = getLastMockCall(UIFieldMock)[0]
        expect(availableTypes).toEqual(TYPE_OPTIONS)
    })

    it('should set `valueShouldOverflow` to true if type is an editable list', () => {
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <Field {...defaultProps} type={LEAF_TYPES.EDITABLE_LIST} />
                </WidgetContext.Provider>
            </Provider>
        )

        expect(getLastMockCall(UIFieldMock)[0].valueShouldOverflow).toBeTruthy()
    })

    it('should call correct actions with appropriate value', () => {
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <Field {...defaultProps} isEditing />
                </WidgetContext.Provider>
            </Provider>
        )

        getLastMockCall(UIFieldMock)[0].onEditionStart()
        let actions = store.getActions()
        expect(actions).toHaveLength(1)
        expect(actions).toContainEqual(
            startWidgetEdition(idTemplate.templatePath!)
        )

        getLastMockCall(UIFieldMock)[0].onEditionStop()
        actions = store.getActions()
        expect(actions).toHaveLength(2)
        expect(actions).toContainEqual(stopWidgetEdition())

        getLastMockCall(UIFieldMock)[0].onDelete()
        actions = store.getActions()
        expect(actions).toHaveLength(3)
        expect(actions).toContainEqual(
            removeEditedWidget(idTemplate.templatePath, defaultAbsolutePath)
        )

        const formData = {title: 'ok', type: LEAF_TYPES.BOOLEAN}
        getLastMockCall(UIFieldMock)[0].onSubmit(formData)
        actions = store.getActions()
        expect(actions).toHaveLength(4)
        expect(actions).toContainEqual(updateEditedWidget(formData))
    })

    it("should not render a copy button if it's editing", () => {
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <Field {...defaultProps} isEditing />
                </WidgetContext.Provider>
            </Provider>
        )

        expect(getLastMockCall(UIFieldMock)[0].copyButton).toBeNull()
    })

    it("should render a copy button  with correct props if it's not editing and there is a copyable value", () => {
        render(
            <Provider store={store}>
                <WidgetContext.Provider value={shopifyWidget}>
                    <Field {...defaultProps} isEditing={false} />
                </WidgetContext.Provider>
            </Provider>
        )

        expect(getLastMockCall(UIFieldMock)[0].copyButton).not.toBeNull()
        expect(getLastMockCall(CopyButtonMock)[0]).toEqual({
            value: defaultProps.copyableValue,
            onCopyMessage: `${idTemplate.title} copied to clipboard`,
        })
    })
})
