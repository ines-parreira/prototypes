import type { ReactNode } from 'react'
import { Fragment } from 'react'

import _capitalize from 'lodash/capitalize'

import type { GuidanceVariableList } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import {
    guidanceVariableRegex,
    parseGuidanceVariable,
} from 'pages/common/draftjs/plugins/guidance-variables/utils'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import { guidanceActionRegex } from 'pages/common/draftjs/plugins/guidanceActions/utils'

import { InlineActionPill } from './InlineActionPill'
import { InlineVariablePill } from './InlineVariablePill'

const MAX_PREVIEW_CHARS = 240

/**
 * Render guidance content as a sequence of plain-text segments + inline pills,
 * matching the editor's `GuidanceVariableTag` / `GuidanceActionTag` styling at
 * a compact size suitable for the hover preview.
 *
 * Same regexes and label resolution that the editor uses, just laid out as
 * inline JSX instead of inside a draft-js editor instance.
 */
export function renderGuidanceContent(
    plainText: string,
    variables: GuidanceVariableList,
    actions: GuidanceAction[],
): ReactNode {
    if (!plainText) return null

    // Single regex that matches either a variable or an action placeholder.
    const combined = new RegExp(
        `(${guidanceVariableRegex.source})|(${guidanceActionRegex.source})`,
        'g',
    )

    const nodes: ReactNode[] = []
    let charsUsed = 0
    let lastIndex = 0
    let key = 0

    const truncate = (text: string): { text: string; truncated: boolean } => {
        const remaining = MAX_PREVIEW_CHARS - charsUsed
        if (remaining <= 0) return { text: '', truncated: true }
        if (text.length <= remaining) {
            charsUsed += text.length
            return { text, truncated: false }
        }
        charsUsed = MAX_PREVIEW_CHARS
        return {
            text: text.slice(0, remaining).trimEnd() + '…',
            truncated: true,
        }
    }

    for (const match of plainText.matchAll(combined)) {
        if (charsUsed >= MAX_PREVIEW_CHARS) break

        if (match.index! > lastIndex) {
            const segment = plainText.slice(lastIndex, match.index)
            const { text, truncated } = truncate(segment)
            if (text) nodes.push(<Fragment key={key++}>{text}</Fragment>)
            if (truncated) break
        }

        const [full, varMatch, actionMatch, actionId] = match
        if (varMatch) {
            const variable = parseGuidanceVariable(varMatch, variables)
            if (variable) {
                const label = `${_capitalize(variable.category)}: ${variable.name}`
                truncate(label) // count toward the char budget
                nodes.push(
                    <InlineVariablePill
                        key={key++}
                        category={variable.category}
                        label={label}
                    />,
                )
            } else {
                // Unknown variable — render as inline text rather than dropping it
                const { text } = truncate(varMatch)
                if (text) nodes.push(<Fragment key={key++}>{text}</Fragment>)
            }
        } else if (actionMatch && actionId !== undefined) {
            const action = actions.find((a) => a.value === actionId)
            const name = action?.name ?? actionId
            truncate(`Use action: ${name}`)
            nodes.push(<InlineActionPill key={key++} label={name} />)
        } else {
            // Defensive: shouldn't happen given the combined regex.
            const { text } = truncate(full)
            if (text) nodes.push(<Fragment key={key++}>{text}</Fragment>)
        }

        lastIndex = match.index! + full.length
    }

    if (lastIndex < plainText.length && charsUsed < MAX_PREVIEW_CHARS) {
        const trailing = plainText.slice(lastIndex)
        const { text } = truncate(trailing)
        if (text) nodes.push(<Fragment key={key++}>{text}</Fragment>)
    }

    return nodes.length > 0 ? <>{nodes}</> : null
}
