import {
    getAvailableFlowVariableListForNode,
    parseFlowVariable,
} from '../models/variables.model'
import {FlowVariableList} from '../models/variables.types'
import {visualBuilderGraphSimpleChoicesFixture} from './visualBuilderGraph.fixtures'

describe('parseFlowVariable', () => {
    test('should parse an available flow variable', () => {
        const availableVariables: FlowVariableList = [
            {
                nodeType: 'text_reply',
                name: 'My text reply',
                value: '{{steps_state["textInput1"].content.text}}',
            },
        ]
        const parsed = parseFlowVariable(
            '{{steps_state["textInput1"].content.text}}',
            availableVariables
        )
        expect(parsed).toEqual({
            nodeType: 'text_reply',
            name: 'My text reply',
            value: '{{steps_state["textInput1"].content.text}}',
        })
    })

    test('should parse an available group flow variable', () => {
        const availableVariables: FlowVariableList = [
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
        const parsed = parseFlowVariable(
            '{{customer.firstname}}',
            availableVariables
        )
        expect(parsed).toEqual({
            name: 'Customer first name',
            value: '{{customer.firstname}}',
        })
    })

    test('should return an invalid flow variable if not found', () => {
        const availableVariables: FlowVariableList = []
        const parsed = parseFlowVariable(
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
        expect(
            getAvailableFlowVariableListForNode(g, 'multiple_choices1')
        ).toEqual([])
    })

    test('selected choice and text input variables available', () => {
        expect(getAvailableFlowVariableListForNode(g, 'file_upload1')).toEqual([
            {
                nodeType: 'multiple_choices',
                name: 'Choices text',
                value: '{{steps_state["choices1"].selected_choice.label}}',
            },
            {
                nodeType: 'text_reply',
                name: 'Text reply text',
                value: '{{steps_state["textInput1"].content.text}}',
            },
        ])
    })

    test('only selected choice available', () => {
        expect(
            getAvailableFlowVariableListForNode(g, 'automated_message1')
        ).toEqual([
            {
                nodeType: 'multiple_choices',
                name: 'Choices text',
                value: '{{steps_state["choices1"].selected_choice.label}}',
            },
        ])
    })
})
