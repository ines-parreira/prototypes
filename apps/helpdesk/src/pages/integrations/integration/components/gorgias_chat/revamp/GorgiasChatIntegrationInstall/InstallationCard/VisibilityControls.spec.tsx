import { createRef } from 'react'

import { act, render } from '@testing-library/react'
import { fromJS } from 'immutable'

import {
    GorgiasChatInstallationVisibilityConditionOperator,
    GorgiasChatInstallationVisibilityMatchConditions,
    GorgiasChatInstallationVisibilityMethod,
} from 'models/integration/types'

import type { VisibilityControlsHandle } from './VisibilityControls'
import VisibilityControls from './VisibilityControls'

const mockButton = jest.fn((__props: any) => null)
const mockSelectField = jest.fn((__props: any) => null)
const mockBanner = jest.fn((__props: any) => null)
const mockIcon = jest.fn((__props: any) => null)
const mockVisibilityCondition = jest.fn((__props: any) => null)
const mockCollapse = jest.fn(({ children }: any) => children)

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Button: (props: any) => mockButton(props),
    ButtonIntent: { Regular: 'regular', Destructive: 'destructive' },
    ButtonVariant: {
        Primary: 'primary',
        Secondary: 'secondary',
        Tertiary: 'tertiary',
    },
    Icon: (props: any) => mockIcon(props),
    IconName: {
        EditPencil: 'edit-pencil',
        TriangleWarning: 'triangle-warning',
        AddPlus: 'add-plus',
    },
    Banner: (props: any) => mockBanner(props),
    SelectField: (props: any) => mockSelectField(props),
    ListItem: ({ label }: any) => <div>{label}</div>,
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatIntegrationInstall/InstallationCard/VisibilityCondition',
    () => ({
        __esModule: true,
        default: (props: any) => mockVisibilityCondition(props),
    }),
)

jest.mock('pages/common/components/Collapse/Collapse', () => ({
    __esModule: true,
    default: (props: any) => mockCollapse(props),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationInstall/utils/validateUrl',
    () => ({
        __esModule: true,
        default: (value: string) => {
            if (!value) return undefined
            if (value.includes('#')) return 'unsupported'
            if (!value.startsWith('http')) return 'invalid'
            return 'valid'
        },
    }),
)

describe('VisibilityControls', () => {
    const mockOpen = jest.fn()
    const mockOnSubmit = jest.fn()
    const mockOnValidate = jest.fn()

    const defaultProps = {
        integration: fromJS({
            meta: {
                installation: {
                    visibility: {
                        method: GorgiasChatInstallationVisibilityMethod.ShowOnEveryPage,
                    },
                },
            },
        }),
        open: mockOpen,
        isOpen: false,
        isUpdate: true,
        canSubmit: true,
        onSubmit: mockOnSubmit,
        onValidate: mockOnValidate,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (props = {}) => {
        return render(<VisibilityControls {...defaultProps} {...props} />)
    }

    describe('Initial render', () => {
        it('should render edit icon in placeholder', () => {
            renderComponent()

            expect(mockIcon).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'edit-pencil',
                }),
            )
        })

        it('should pass isOpen prop to Collapse', () => {
            renderComponent({ isOpen: false })

            expect(mockCollapse).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOpen: false,
                }),
            )
        })

        it('should pass isOpen true to Collapse when open', () => {
            renderComponent({ isOpen: true })

            expect(mockCollapse).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOpen: true,
                }),
            )
        })
    })

    describe('Visibility method selection', () => {
        it('should render visibility method dropdown with correct options', () => {
            renderComponent({ isOpen: true })

            const selectCalls = mockSelectField.mock.calls as any[]
            const visibilityMethodSelect = selectCalls[0]

            expect(visibilityMethodSelect[0].items).toHaveLength(3)
            expect(visibilityMethodSelect[0].items[0].label).toBe(
                'Show on every page',
            )
            expect(visibilityMethodSelect[0].items[1].label).toBe(
                'Show on specific pages',
            )
            expect(visibilityMethodSelect[0].items[2].label).toBe(
                'Hide on specific pages',
            )
        })

        it('should select ShowOnEveryPage by default', () => {
            renderComponent({ isOpen: true })

            const selectCalls = mockSelectField.mock.calls as any[]
            const visibilityMethodSelect = selectCalls[0]

            expect(visibilityMethodSelect[0].value.value).toBe(
                GorgiasChatInstallationVisibilityMethod.ShowOnEveryPage,
            )
        })

        it('should select correct initial visibility method from integration', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const selectCalls = mockSelectField.mock.calls as any[]
            const visibilityMethodSelect = selectCalls[0]

            expect(visibilityMethodSelect[0].value.value).toBe(
                GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
            )
        })

        it('should not render conditions when visibility method is ShowOnEveryPage', () => {
            renderComponent({ isOpen: true })

            expect(mockVisibilityCondition).not.toHaveBeenCalled()
        })

        it('should render conditions when visibility method is ShowOnSpecificPages', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            expect(mockVisibilityCondition).toHaveBeenCalled()
        })
    })

    describe('Match conditions selection', () => {
        it('should render match conditions dropdown for ShowOnSpecificPages', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const selectCalls = mockSelectField.mock.calls
            expect(selectCalls).toHaveLength(2)

            const matchConditionsSelect = selectCalls[1]
            expect(matchConditionsSelect[0].items).toHaveLength(2)
            expect(matchConditionsSelect[0].items[0].label).toBe(
                'All conditions',
            )
            expect(matchConditionsSelect[0].items[1].label).toBe(
                'At least one of the conditions',
            )
        })

        it('should select correct initial match conditions from integration', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            match_conditions:
                                GorgiasChatInstallationVisibilityMatchConditions.Every,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const selectCalls = mockSelectField.mock.calls
            const matchConditionsSelect = selectCalls[1]

            expect(matchConditionsSelect[0].value.value).toBe(
                GorgiasChatInstallationVisibilityMatchConditions.Every,
            )
        })
    })

    describe('Conditions management', () => {
        it('should render conditions from integration', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            expect(mockVisibilityCondition).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: 'https://example.com',
                    operator:
                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                }),
            )
        })

        it('should create default condition when none exist', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            expect(mockVisibilityCondition).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: '',
                    operator:
                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                }),
            )
        })

        it('should mark first condition as not deletable when there is only one', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            expect(mockVisibilityCondition).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDeletable: false,
                }),
            )
        })

        it('should mark conditions as deletable when there are multiple', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                                {
                                    id: '2',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const calls = mockVisibilityCondition.mock.calls
            expect(calls[0][0].isDeletable).toBe(true)
            expect(calls[1][0].isDeletable).toBe(true)
        })

        it('should pass onChange and onDelete handlers to conditions', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            expect(mockVisibilityCondition).toHaveBeenCalledWith(
                expect.objectContaining({
                    onChange: expect.any(Function),
                    onDelete: expect.any(Function),
                }),
            )
        })

        it('should call onValidate with true when condition value is valid', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const onChangeHandler =
                mockVisibilityCondition.mock.calls[0][0].onChange
            act(() => {
                onChangeHandler({ value: 'https://example.com' })
            })

            expect(mockOnValidate).toHaveBeenCalledWith(true)
        })

        it('should call onValidate with false when condition value is invalid', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const onChangeHandler =
                mockVisibilityCondition.mock.calls[0][0].onChange
            act(() => {
                onChangeHandler({ value: 'invalid' })
            })

            expect(mockOnValidate).toHaveBeenCalledWith(false)
        })

        it('should pass validation result to condition', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const onChangeHandler =
                mockVisibilityCondition.mock.calls[0][0].onChange
            act(() => {
                onChangeHandler({ value: 'https://example.com#hash' })
            })

            expect(mockVisibilityCondition).toHaveBeenCalledWith(
                expect.objectContaining({
                    validationResult: 'unsupported',
                }),
            )
        })

        it('should not pass validation result when value is empty', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            expect(mockVisibilityCondition).toHaveBeenCalledWith(
                expect.objectContaining({
                    validationResult: undefined,
                }),
            )
        })
    })

    describe('Incompatible conditions warning', () => {
        it('should show warning banner when using Every with multiple Equal operators', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            match_conditions:
                                GorgiasChatInstallationVisibilityMatchConditions.Every,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Equal,
                                },
                                {
                                    id: '2',
                                    value: 'https://test.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Equal,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            expect(mockBanner).toHaveBeenCalledWith(
                expect.objectContaining({
                    variant: 'inline',
                    intent: 'warning',
                    icon: 'triangle-warning',
                    title: 'The selected conditions are incompatible. ',
                }),
            )
        })

        it('should not show warning with Some match condition', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            match_conditions:
                                GorgiasChatInstallationVisibilityMatchConditions.Some,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Equal,
                                },
                                {
                                    id: '2',
                                    value: 'https://test.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Equal,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            expect(mockBanner).not.toHaveBeenCalled()
        })

        it('should not show warning with only one Equal operator', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            match_conditions:
                                GorgiasChatInstallationVisibilityMatchConditions.Every,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Equal,
                                },
                                {
                                    id: '2',
                                    value: 'https://test.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            expect(mockBanner).not.toHaveBeenCalled()
        })
    })

    describe('Update installation button', () => {
        it('should render update button when isUpdate is true and visibility method changed', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const buttonCalls = mockButton.mock.calls as any[]
            const updateButton = buttonCalls.find(
                (call) => call[0].children === 'Update installation',
            )

            expect(updateButton).toBeDefined()
        })

        it('should not render update button when isUpdate is false', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, isUpdate: false, integration })

            const buttonCalls = mockButton.mock.calls as any[]
            const updateButton = buttonCalls.find(
                (call) => call[0].children === 'Update installation',
            )

            expect(updateButton).toBeUndefined()
        })

        it('should disable update button when not dirty', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const buttonCalls = mockButton.mock.calls as any[]
            const updateButton = buttonCalls.find(
                (call) => call[0].children === 'Update installation',
            )

            expect(updateButton).toBeDefined()
            expect(updateButton[0].isDisabled).toBe(true)
        })

        it('should disable update button when canSubmit is false', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.HideOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration, canSubmit: false })

            const buttonCalls = mockButton.mock.calls as any[]
            const updateButton = buttonCalls.find(
                (call) => call[0].children === 'Update installation',
            )

            expect(updateButton).toBeDefined()
            expect(updateButton[0].isDisabled).toBe(true)
        })

        it('should disable update button when has validation error', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const onChangeHandler =
                mockVisibilityCondition.mock.calls[0][0].onChange
            act(() => {
                onChangeHandler({ value: 'invalid' })
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const updateButton = buttonCalls.find(
                (call) => call[0].children === 'Update installation',
            )

            expect(updateButton).toBeDefined()
            expect(updateButton[0].isDisabled).toBe(true)
        })

        it('should disable update button when has incompatible conditions', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            match_conditions:
                                GorgiasChatInstallationVisibilityMatchConditions.Every,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Equal,
                                },
                                {
                                    id: '2',
                                    value: 'https://test.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Equal,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const buttonCalls = mockButton.mock.calls as any[]
            const updateButton = buttonCalls.find(
                (call) => call[0].children === 'Update installation',
            )

            expect(updateButton).toBeDefined()
            expect(updateButton[0].isDisabled).toBe(true)
        })

        it('should enable update button when dirty and valid', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const onChangeHandler =
                mockVisibilityCondition.mock.calls[0][0].onChange
            act(() => {
                onChangeHandler({ value: 'https://newurl.com' })
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const updateButton = buttonCalls[buttonCalls.length - 1]

            expect(updateButton).toBeDefined()
            expect(updateButton[0].isDisabled).toBe(false)
        })

        it('should call onSubmit with updated visibility when update button is clicked', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const initialCallsCount = mockButton.mock.calls.length

            const onChangeHandler =
                mockVisibilityCondition.mock.calls[0][0].onChange
            act(() => {
                onChangeHandler({ value: 'https://newurl.com' })
            })

            const buttonCalls = mockButton.mock.calls as any[]
            const updateButtons = buttonCalls
                .slice(initialCallsCount)
                .filter((call) => call[0].children === 'Update installation')
            const updateButton = updateButtons[updateButtons.length - 1]

            expect(updateButton).toBeDefined()

            act(() => {
                updateButton[0].onClick()
            })

            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                    conditions: expect.arrayContaining([
                        expect.objectContaining({
                            value: 'https://newurl.com',
                        }),
                    ]),
                }),
            )
        })
    })

    describe('Add URL button', () => {
        it('should render Add URL button when not ShowOnEveryPage', () => {
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })
            renderComponent({ isOpen: true, integration })

            const buttonCalls = mockButton.mock.calls as any[]
            const addButton = buttonCalls.find(
                (call) => call[0].children === 'Add URL',
            )

            expect(addButton).toBeDefined()
            expect(addButton[0].leadingSlot).toBe('add-plus')
            expect(addButton[0].variant).toBe('tertiary')
            expect(addButton[0].intent).toBe('regular')
        })

        it('should not render Add URL button when ShowOnEveryPage', () => {
            renderComponent({ isOpen: true })

            const buttonCalls = mockButton.mock.calls as any[]
            const addButton = buttonCalls.find(
                (call) => call[0].children === 'Add URL',
            )

            expect(addButton).toBeUndefined()
        })
    })

    describe('Ref handle', () => {
        it('should expose visibility through ref', () => {
            const ref = createRef<VisibilityControlsHandle>()
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: 'https://example.com',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })

            render(
                <VisibilityControls
                    ref={ref}
                    integration={integration}
                    open={mockOpen}
                    isOpen={true}
                    isUpdate={true}
                    canSubmit={true}
                    onSubmit={mockOnSubmit}
                    onValidate={mockOnValidate}
                />,
            )

            expect(ref.current?.visibility).toBeDefined()
            expect(ref.current?.visibility.method).toBe(
                GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
            )
        })

        it('should return ShowOnEveryPage when all conditions are empty', () => {
            const ref = createRef<VisibilityControlsHandle>()
            const integration = fromJS({
                meta: {
                    installation: {
                        visibility: {
                            method: GorgiasChatInstallationVisibilityMethod.ShowOnSpecificPages,
                            conditions: [
                                {
                                    id: '1',
                                    value: '',
                                    operator:
                                        GorgiasChatInstallationVisibilityConditionOperator.Contain,
                                },
                            ],
                        },
                    },
                },
            })

            render(
                <VisibilityControls
                    ref={ref}
                    integration={integration}
                    open={mockOpen}
                    isOpen={true}
                    isUpdate={true}
                    canSubmit={true}
                    onSubmit={mockOnSubmit}
                    onValidate={mockOnValidate}
                />,
            )

            expect(ref.current?.visibility.method).toBe(
                GorgiasChatInstallationVisibilityMethod.ShowOnEveryPage,
            )
        })
    })

    describe('Disabled state', () => {
        it('should apply disabled class when isUpdate is false', () => {
            const { container } = renderComponent({ isUpdate: false })

            const wrapper = container.firstChild as HTMLElement
            expect(wrapper.className).toContain('disabled')
        })

        it('should not apply disabled class when isUpdate is true', () => {
            const { container } = renderComponent({ isUpdate: true })

            const wrapper = container.firstChild as HTMLElement
            expect(wrapper.className).not.toContain('disabled')
        })
    })
})
