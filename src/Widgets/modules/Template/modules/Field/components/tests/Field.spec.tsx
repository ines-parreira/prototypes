import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'

import { idTemplate } from 'fixtures/widgets'
import { LEAF_TYPES } from 'models/widget/constants'
import {
    removeEditedWidget,
    startWidgetEdition,
    stopWidgetEdition,
    updateEditedWidget,
} from 'state/widgets/actions'
import { assumeMock, getLastMockCall } from 'utils/testing'

import CopyButton from '../CopyButton'
import Field from '../Field'
import UIField from '../views'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('../CopyButton', () => jest.fn(() => <span>copy button</span>))
const CopyButtonMock = assumeMock(CopyButton)

jest.mock('../views', () =>
    jest.fn(({ copyButton }: { copyButton: React.ReactNode }) => {
        return <span>ui field {copyButton}</span>
    }),
)
const UIFieldMock = assumeMock(UIField)

describe('Field', () => {
    const defaultAbsolutePath = ['foo', 'bar']
    const defaultTemplate = { ...idTemplate, absolutePath: defaultAbsolutePath }

    const defaultProps: ComponentProps<typeof Field> = {
        value: 'foo value',
        type: LEAF_TYPES.TEXT,
        isEditing: false,
        template: defaultTemplate,
        copyableValue: 'copyable value',
        valueCanOverflow: false,
        editionHiddenFields: ['title'],
    }

    it('should prepare available types', () => {
        render(<Field {...defaultProps} />)
        expect(getLastMockCall(UIFieldMock)[0].availableTypes).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    value: expect.any(String),
                    label: expect.any(String),
                }),
            ]),
        )
    })

    it('should pass template title, value, type, isEditing, canOverflow and editionHiddenFields to the UI field', () => {
        render(<Field {...defaultProps} />)

        expect(getLastMockCall(UIFieldMock)[0]).toEqual(
            expect.objectContaining({
                title: idTemplate.title,
                value: defaultProps.value,
                type: defaultProps.type,
                isEditionMode: defaultProps.isEditing,
                valueCanOverflow: defaultProps.valueCanOverflow,
                editionHiddenFields: defaultProps.editionHiddenFields,
            }),
        )
    })

    it('should pass valueCanOverflow to `false` when undefined', () => {
        render(<Field {...defaultProps} valueCanOverflow={undefined} />)

        expect(getLastMockCall(UIFieldMock)[0].valueCanOverflow).toBe(false)
    })

    it('should call correct actions with appropriate value', () => {
        render(<Field {...defaultProps} isEditing />)

        getLastMockCall(UIFieldMock)[0].onEditionStart()
        expect(mockedDispatch).toHaveBeenCalledTimes(1)
        expect(mockedDispatch).toHaveBeenLastCalledWith(
            startWidgetEdition(idTemplate.templatePath!),
        )

        getLastMockCall(UIFieldMock)[0].onEditionStop()
        expect(mockedDispatch).toHaveBeenCalledTimes(2)
        expect(mockedDispatch).toHaveBeenLastCalledWith(stopWidgetEdition())

        getLastMockCall(UIFieldMock)[0].onDelete()
        expect(mockedDispatch).toHaveBeenCalledTimes(3)
        expect(mockedDispatch).toHaveBeenLastCalledWith(
            removeEditedWidget(idTemplate.templatePath, defaultAbsolutePath),
        )

        const formData = { title: 'ok', type: LEAF_TYPES.BOOLEAN }
        getLastMockCall(UIFieldMock)[0].onSubmit(formData)
        expect(mockedDispatch).toHaveBeenCalledTimes(4)
        expect(mockedDispatch).toHaveBeenLastCalledWith(
            updateEditedWidget(formData),
        )
    })

    it("should not render a copy button if it's editing", () => {
        render(<Field {...defaultProps} isEditing />)

        expect(getLastMockCall(UIFieldMock)[0].copyButton).toBeNull()
    })

    it("should render a copy button  with correct props if it's not editing and there is a copyable value", () => {
        render(<Field {...defaultProps} isEditing={false} />)

        expect(getLastMockCall(UIFieldMock)[0].copyButton).not.toBeNull()
        expect(getLastMockCall(CopyButtonMock)[0]).toEqual({
            value: defaultProps.copyableValue,
            onCopyMessage: `${idTemplate.title} copied to clipboard`,
        })
    })
})
