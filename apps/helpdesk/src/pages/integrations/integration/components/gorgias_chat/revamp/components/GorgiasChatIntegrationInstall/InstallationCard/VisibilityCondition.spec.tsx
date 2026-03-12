import { forwardRef } from 'react'

import { render } from '@testing-library/react'

import { GorgiasChatInstallationVisibilityConditionOperator } from 'models/integration/types'

import VisibilityCondition from './VisibilityCondition'

const mockButton = jest.fn((__props: any) => null)
const mockSelectField = jest.fn((__props: any) => null)
const mockTextField = jest.fn((__props: any) => null)
const mockTooltip = jest.fn(({ trigger, children }: any) => (
    <>
        {trigger}
        {children}
    </>
))
const mockTooltipContent = jest.fn((__props: any) => null)
const mockIcon = jest.fn((__props: any) => null)

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Button: forwardRef((props: any, __ref: any) => {
        mockButton(props)
        return null
    }),
    Icon: (props: any) => mockIcon(props),
    SelectField: (props: any) => mockSelectField(props),
    TextField: (props: any) => mockTextField(props),
    Tooltip: (props: any) => mockTooltip(props),
    TooltipContent: (props: any) => mockTooltipContent(props),
    ListItem: ({ label }: any) => <div>{label}</div>,
}))

describe('VisibilityCondition', () => {
    const mockOnChange = jest.fn()
    const mockOnDelete = jest.fn()

    const defaultProps = {
        value: '',
        operator: GorgiasChatInstallationVisibilityConditionOperator.Contain,
        onChange: mockOnChange,
        onDelete: mockOnDelete,
        isDeletable: true,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (props = {}) => {
        return render(<VisibilityCondition {...defaultProps} {...props} />)
    }

    describe('Page URL button', () => {
        it('should render Page URL button with correct props', () => {
            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const pageUrlButton = buttonCalls.find(
                (call) => call[0].children === 'Page URL',
            )

            expect(pageUrlButton).toBeDefined()
            expect(pageUrlButton[0].variant).toBe('secondary')
            expect(pageUrlButton[0].intent).toBe('regular')
        })
    })

    describe('Operator SelectField', () => {
        it('should render operator dropdown with correct options', () => {
            renderComponent()

            const selectCalls = mockSelectField.mock.calls as any[]
            const operatorSelect = selectCalls[0]

            expect(operatorSelect[0].items).toHaveLength(4)
            expect(operatorSelect[0].items[0].label).toBe('contains')
            expect(operatorSelect[0].items[1].label).toBe('does not contain')
            expect(operatorSelect[0].items[2].label).toBe('is')
            expect(operatorSelect[0].items[3].label).toBe('is not')
        })

        it('should select correct initial operator', () => {
            renderComponent({
                operator:
                    GorgiasChatInstallationVisibilityConditionOperator.Equal,
            })

            const selectCalls = mockSelectField.mock.calls as any[]
            const operatorSelect = selectCalls[0]

            expect(operatorSelect[0].value.value).toBe(
                GorgiasChatInstallationVisibilityConditionOperator.Equal,
            )
        })

        it('should pass onChange handler that updates operator', () => {
            renderComponent()

            const selectCalls = mockSelectField.mock.calls as any[]
            const operatorSelect = selectCalls[0]

            expect(operatorSelect[0].onChange).toEqual(expect.any(Function))

            operatorSelect[0].onChange({
                value: GorgiasChatInstallationVisibilityConditionOperator.NotContain,
            })

            expect(mockOnChange).toHaveBeenCalledWith({
                operator:
                    GorgiasChatInstallationVisibilityConditionOperator.NotContain,
            })
        })
    })

    describe('Value TextField', () => {
        it('should render text field with correct value', () => {
            renderComponent({ value: 'https://example.com' })

            const textFieldCalls = mockTextField.mock.calls as any[]
            const textField = textFieldCalls[0]

            expect(textField[0].value).toBe('https://example.com')
        })

        it('should pass onChange handler that updates value', () => {
            renderComponent()

            const textFieldCalls = mockTextField.mock.calls as any[]
            const textField = textFieldCalls[0]

            expect(textField[0].onChange).toEqual(expect.any(Function))

            textField[0].onChange('https://newurl.com')

            expect(mockOnChange).toHaveBeenCalledWith({
                value: 'https://newurl.com',
            })
        })

        it('should not show error when validationResult is undefined', () => {
            renderComponent({ validationResult: undefined })

            const textFieldCalls = mockTextField.mock.calls as any[]
            const textField = textFieldCalls[0]

            expect(textField[0].error).toBeUndefined()
        })

        it('should not show error when validationResult is valid', () => {
            renderComponent({ validationResult: 'valid' })

            const textFieldCalls = mockTextField.mock.calls as any[]
            const textField = textFieldCalls[0]

            expect(textField[0].error).toBeUndefined()
        })

        it('should show error when validationResult is invalid', () => {
            renderComponent({ validationResult: 'invalid' })

            const textFieldCalls = mockTextField.mock.calls as any[]
            const textField = textFieldCalls[0]

            expect(textField[0].error).toBeDefined()
        })

        it('should show error when validationResult is unsupported', () => {
            renderComponent({ validationResult: 'unsupported' })

            const textFieldCalls = mockTextField.mock.calls as any[]
            const textField = textFieldCalls[0]

            expect(textField[0].error).toBeDefined()
        })
    })

    describe('Delete button', () => {
        it('should render delete button with correct icon', () => {
            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const deleteButton = buttonCalls.find(
                (call) => call[0].icon === 'close',
            )

            expect(deleteButton).toBeDefined()
            expect(deleteButton[0].variant).toBe('tertiary')
        })

        it('should enable delete button when isDeletable is true', () => {
            renderComponent({ isDeletable: true })

            const buttonCalls = mockButton.mock.calls as any[]
            const deleteButton = buttonCalls.find(
                (call) => call[0].icon === 'close',
            )

            expect(deleteButton[0].isDisabled).toBe(false)
            expect(deleteButton[0].intent).toBe('destructive')
        })

        it('should disable delete button when isDeletable is false', () => {
            renderComponent({ isDeletable: false })

            const buttonCalls = mockButton.mock.calls as any[]
            const deleteButton = buttonCalls.find(
                (call) => call[0].icon === 'close',
            )

            expect(deleteButton[0].isDisabled).toBe(true)
            expect(deleteButton[0].intent).toBe('regular')
        })

        it('should call onDelete when delete button is clicked', () => {
            renderComponent()

            const buttonCalls = mockButton.mock.calls as any[]
            const deleteButton = buttonCalls.find(
                (call) => call[0].icon === 'close',
            )

            deleteButton[0].onClick()

            expect(mockOnDelete).toHaveBeenCalled()
        })
    })

    describe('Tooltip', () => {
        it('should render tooltip with correct props when deletable', () => {
            renderComponent({ isDeletable: true })

            const tooltipCalls = mockTooltip.mock.calls as any[]
            const tooltip = tooltipCalls[0]

            expect(tooltip[0].placement).toBe('top')
            expect(tooltip[0].isDisabled).toBe(true)
            expect(tooltip[0].delay).toBe(100)
        })

        it('should enable tooltip when not deletable', () => {
            renderComponent({ isDeletable: false })

            const tooltipCalls = mockTooltip.mock.calls as any[]
            const tooltip = tooltipCalls[0]

            expect(tooltip[0].isDisabled).toBe(false)
        })
    })

    describe('Operator values', () => {
        it('should handle Contain operator', () => {
            renderComponent({
                operator:
                    GorgiasChatInstallationVisibilityConditionOperator.Contain,
            })

            const selectCalls = mockSelectField.mock.calls as any[]
            const operatorSelect = selectCalls[0]

            expect(operatorSelect[0].value.value).toBe(
                GorgiasChatInstallationVisibilityConditionOperator.Contain,
            )
            expect(operatorSelect[0].value.label).toBe('contains')
        })

        it('should handle NotContain operator', () => {
            renderComponent({
                operator:
                    GorgiasChatInstallationVisibilityConditionOperator.NotContain,
            })

            const selectCalls = mockSelectField.mock.calls as any[]
            const operatorSelect = selectCalls[0]

            expect(operatorSelect[0].value.value).toBe(
                GorgiasChatInstallationVisibilityConditionOperator.NotContain,
            )
            expect(operatorSelect[0].value.label).toBe('does not contain')
        })

        it('should handle Equal operator', () => {
            renderComponent({
                operator:
                    GorgiasChatInstallationVisibilityConditionOperator.Equal,
            })

            const selectCalls = mockSelectField.mock.calls as any[]
            const operatorSelect = selectCalls[0]

            expect(operatorSelect[0].value.value).toBe(
                GorgiasChatInstallationVisibilityConditionOperator.Equal,
            )
            expect(operatorSelect[0].value.label).toBe('is')
        })

        it('should handle NotEqual operator', () => {
            renderComponent({
                operator:
                    GorgiasChatInstallationVisibilityConditionOperator.NotEqual,
            })

            const selectCalls = mockSelectField.mock.calls as any[]
            const operatorSelect = selectCalls[0]

            expect(operatorSelect[0].value.value).toBe(
                GorgiasChatInstallationVisibilityConditionOperator.NotEqual,
            )
            expect(operatorSelect[0].value.label).toBe('is not')
        })
    })
})
