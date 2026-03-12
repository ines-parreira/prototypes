import type { ContentBlock, ContentState } from 'draft-js'
import { Modifier, SelectionState } from 'draft-js'
import _capitalize from 'lodash/capitalize'

import logoGorgias from 'assets/img/icons/gorgias-icon-logo-black.png'
import logoShopify from 'assets/img/integrations/shopify.svg'
import type {
    GuidanceVariable,
    GuidanceVariableGroup,
    GuidanceVariableList,
} from 'pages/aiAgent/components/GuidanceEditor/variables.types'

// Variable regex patterns

export const guidanceVariableRegex = /&&&[^&]*&&&/g

/**
 * Find all guidance variables in a list of guidance variables
 */
export function findManyGuidanceVariables(
    variables: GuidanceVariableList,
    fn: (
        v: GuidanceVariable | GuidanceVariableGroup,
    ) => GuidanceVariable | undefined,
): GuidanceVariable[] {
    const result: GuidanceVariable[] = []
    for (const variable of variables) {
        const found = fn(variable)
        if (found) {
            result.push(found)
        }
        if ('variables' in variable) {
            const vars = findManyGuidanceVariables(variable.variables, fn)
            result.push(...vars)
        }
    }
    return result
}

/**
 * Find a guidance variable in a list of guidance variables
 */
export function findGuidanceVariable(
    variables: GuidanceVariableList,
    fn: (
        v: GuidanceVariable | GuidanceVariableGroup,
    ) => GuidanceVariable | undefined,
): GuidanceVariable | undefined {
    for (const variable of variables) {
        const result = fn(variable)
        if (result) {
            return result
        }
        if ('variables' in variable) {
            const recursiveResult = findGuidanceVariable(variable.variables, fn)
            if (recursiveResult) {
                return recursiveResult
            }
        }
    }
    return undefined
}

/**
 * Parse guidance variable from a value string
 */
export function parseGuidanceVariable(
    value: string,
    availableVariables: GuidanceVariableList,
): GuidanceVariable | null {
    const variable = findGuidanceVariable(availableVariables, (v) => {
        if ('value' in v && v.value === value) {
            return v
        }

        return undefined
    })

    if (!variable) return null

    return variable
}

/**
 * Add entity to a variable in the editor
 * Works for both workflow and guidance variables
 */
export const addGuidanceVariableEntity = (
    block: ContentBlock,
    contentState: ContentState,
    start: number,
    end: number,
): ContentState => {
    const existingEntityKey = block.getEntityAt(start)
    if (existingEntityKey) {
        // avoid manipulation in case the variable already has an entity
        const entity = contentState.getEntity(existingEntityKey)
        if (entity && entity.getType() === 'guidance_variable') {
            return contentState
        }
    }

    const value = block.getText().substring(start, end)

    const entityData: { value: string } = { value }

    let newContentState = contentState

    const contentStateWithEntity = newContentState.createEntity(
        'guidance_variable',
        'IMMUTABLE',
        entityData,
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

export const replaceGuidanceVariablesPlaceholdersWithLabels = (
    content: string,
    guidanceVariables: GuidanceVariableList,
): string => {
    return content.replace(guidanceVariableRegex, (match) => {
        const variable = parseGuidanceVariable(match, guidanceVariables)
        if (!variable) return match

        return `${_capitalize(variable.category)}: ${variable.name}`
    })
}

/**
 * Get logo configuration based on variable category
 */
export const pickCategoryLogo = (
    category: string,
): { src: string; alt: string } => {
    if (category.toLowerCase() === 'ticket') {
        return { src: logoGorgias, alt: 'gorgias logo' }
    }

    return { src: logoShopify, alt: 'shopify logo' }
}

export const pickCategoryIconName = (
    category: string,
): 'gorgias-logo' | 'app-shopify' => {
    return category.toLowerCase() === 'ticket' ? 'gorgias-logo' : 'app-shopify'
}
