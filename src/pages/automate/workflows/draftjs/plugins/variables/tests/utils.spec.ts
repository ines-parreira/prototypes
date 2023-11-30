import {ContentState} from 'draft-js'
import findWithRegex from 'find-with-regex'
import {workflowVariableRegex} from 'pages/automate/workflows/models/variables.model'
import {addEntityToVariable} from '../utils'

describe('addEntityToVariable', () => {
    test('should replace with entity if a flow variable pattern is detected', () => {
        const contentState = ContentState.createFromText(
            'Hello {{customer.firstname}} {{customer.lastname}}'
        )
        const block = contentState.getFirstBlock()
        // parsing firstname variable
        let newContentState = contentState
        findWithRegex(workflowVariableRegex, block, (start, end) => {
            newContentState = addEntityToVariable(
                block,
                newContentState,
                start,
                end
            )
        })
        const firstnameVarEntity = newContentState.getEntity('1')
        const lastnameVarEntity = newContentState.getEntity('2')
        expect(firstnameVarEntity.getType()).toEqual('flow_variable')
        expect(lastnameVarEntity.getType()).toEqual('flow_variable')
        expect(firstnameVarEntity.getMutability()).toEqual('IMMUTABLE')
        expect(lastnameVarEntity.getMutability()).toEqual('IMMUTABLE')
        expect(firstnameVarEntity.getData()).toEqual({
            value: '{{customer.firstname}}',
        })
        expect(lastnameVarEntity.getData()).toEqual({
            value: '{{customer.lastname}}',
        })
    })
})
