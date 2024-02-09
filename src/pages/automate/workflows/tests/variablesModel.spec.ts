import {
    getWorkflowVariableListForNode,
    parseWorkflowVariable,
} from '../models/variables.model'
import {WorkflowVariableList} from '../models/variables.types'
import {visualBuilderGraphSimpleChoicesFixture} from './visualBuilderGraph.fixtures'

describe('parseWorkflowVariable', () => {
    test('should parse an available flow variable', () => {
        const availableVariables: WorkflowVariableList = [
            {
                nodeType: 'text_reply',
                name: 'My text reply',
                value: '{{steps_state.text_reply1.content.text}}',
            },
        ]
        const parsed = parseWorkflowVariable(
            '{{steps_state.text_reply1.content.text}}',
            availableVariables
        )
        expect(parsed).toEqual({
            nodeType: 'text_reply',
            name: 'My text reply',
            value: '{{steps_state.text_reply1.content.text}}',
        })
    })

    test('should parse an available group flow variable', () => {
        const availableVariables: WorkflowVariableList = [
            {
                nodeType: 'order_selection',
                name: 'My order selection',
                variables: [
                    {
                        name: 'Customer first name',
                        value: '{{customer.firstname}}',
                    },
                ],
            },
        ]
        const parsed = parseWorkflowVariable(
            '{{customer.firstname}}',
            availableVariables
        )
        expect(parsed).toEqual({
            name: 'Customer first name',
            value: '{{customer.firstname}}',
        })
    })

    test('should return an invalid flow variable if not found', () => {
        const availableVariables: WorkflowVariableList = []
        const parsed = parseWorkflowVariable(
            '{{customer.firstname}}',
            availableVariables
        )
        expect(parsed).toEqual({
            isInvalid: true,
            name: 'variable unavailable',
            value: '{{customer.firstname}}',
        })
    })
})

describe('getAvailableFlowVariables', () => {
    const g = visualBuilderGraphSimpleChoicesFixture
    test('no available variables at the beginning of the flow', () => {
        expect(getWorkflowVariableListForNode(g, 'multiple_choices1')).toEqual(
            []
        )
    })

    test('selected choice and text input variables available', () => {
        expect(getWorkflowVariableListForNode(g, 'file_upload1')).toEqual([
            {
                nodeType: 'multiple_choices',
                name: 'Choices text',
                value: '{{steps_state.multiple_choices1.selected_choice.label}}',
            },
            {
                nodeType: 'text_reply',
                name: 'Text reply text',
                value: '{{steps_state.text_reply1.content.text}}',
            },
        ])
    })

    test('only selected choice available', () => {
        expect(getWorkflowVariableListForNode(g, 'automated_message1')).toEqual(
            [
                {
                    nodeType: 'multiple_choices',
                    name: 'Choices text',
                    value: '{{steps_state.multiple_choices1.selected_choice.label}}',
                },
            ]
        )
    })
})
