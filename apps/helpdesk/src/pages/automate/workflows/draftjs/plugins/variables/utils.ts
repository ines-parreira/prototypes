import { ContentBlock, ContentState, Modifier, SelectionState } from 'draft-js'

import {
    extractVariablesFromText,
    parseWorkflowVariable,
} from 'pages/automate/workflows/models/variables.model'
import { WorkflowVariableList } from 'pages/automate/workflows/models/variables.types'

export const addEntityToVariable = (
    block: ContentBlock,
    contentState: ContentState,
    start: number,
    end: number,
    variables?: WorkflowVariableList,
    isLiquidTemplate: boolean = false,
): ContentState => {
    const existingEntityKey = block.getEntityAt(start)
    if (existingEntityKey) {
        // avoid manipulation in case the flow variable already has an entity
        const entity = contentState.getEntity(existingEntityKey)
        if (entity && entity.getType() === 'flow_variable') {
            return contentState
        }
    }

    const value = block.getText().substring(start, end)
    const variable = parseWorkflowVariable(
        extractVariablesFromText(value, isLiquidTemplate)?.[0]?.value ?? '',
        variables || [],
    )

    let newContentState = contentState

    const contentStateWithEntity = newContentState.createEntity(
        'flow_variable',
        'IMMUTABLE',
        { value, format: variable?.format },
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()

    const selection = SelectionState.createEmpty(block.getKey()).merge({
        anchorOffset: start,
        focusOffset: end,
    })
    // assign entity
    newContentState = Modifier.replaceText(
        newContentState,
        selection,
        value,
        undefined,
        entityKey,
    )
    return newContentState
}
