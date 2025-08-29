import { memo, useMemo } from 'react'

import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import { GuidanceVariableList } from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import GuidanceVariableTag from 'pages/common/draftjs/plugins/guidance-variables/GuidanceVariableTag'
import GuidanceActionTag from 'pages/common/draftjs/plugins/guidanceActions/GuidanceActionTag'
import { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'

export enum PlaceholderType {
    VARIABLE = 'variable',
    ACTION = 'action',
}

const GUIDANCE_VARIABLE_DELIMITER = '&&&'
const GUIDANCE_ACTION_DELIMITER = '$$$'

const GUIDANCE_VARIABLE_REGEX = /&&&[^&]*&&&/g
const GUIDANCE_ACTION_REGEX = /\$\$\$([^\$]*)\$\$\$/g

type KnowledgeSourcePreviewContentRendererProps = {
    content: string
    guidanceVariables: GuidanceVariableList
    guidanceActions: GuidanceAction[]
    shopName: string
}

export const KnowledgeSourcePreviewContentRenderer = memo(
    ({
        content,
        guidanceVariables,
        guidanceActions,
        shopName,
    }: KnowledgeSourcePreviewContentRendererProps) => {
        const { processedContent, placeholders } = useMemo(() => {
            const foundPlaceholders: Array<{
                type: PlaceholderType
                value: string
            }> = []

            const combinedRegex = new RegExp(
                `(${GUIDANCE_VARIABLE_REGEX.source})|(${GUIDANCE_ACTION_REGEX.source})`,
                'g',
            )

            const matches: Array<{
                match: string
                start: number
                end: number
                type: PlaceholderType
            }> = []

            let match
            while ((match = combinedRegex.exec(content)) !== null) {
                const fullMatch = match[0]

                if (
                    fullMatch.startsWith(GUIDANCE_VARIABLE_DELIMITER) &&
                    fullMatch.endsWith(GUIDANCE_VARIABLE_DELIMITER)
                ) {
                    matches.push({
                        match: fullMatch,
                        start: match.index,
                        end: match.index + fullMatch.length,
                        type: PlaceholderType.VARIABLE,
                    })
                } else if (
                    fullMatch.startsWith(GUIDANCE_ACTION_DELIMITER) &&
                    fullMatch.endsWith(GUIDANCE_ACTION_DELIMITER)
                ) {
                    matches.push({
                        match: fullMatch,
                        start: match.index,
                        end: match.index + fullMatch.length,
                        type: PlaceholderType.ACTION,
                    })
                }
            }

            let processed = content
            matches
                .sort((a, b) => b.start - a.start)
                .forEach((matchInfo, reverseIndex) => {
                    const placeholderIndex = matches.length - 1 - reverseIndex
                    foundPlaceholders.unshift({
                        type: matchInfo.type,
                        value: matchInfo.match,
                    })

                    processed =
                        processed.substring(0, matchInfo.start) +
                        `<kbd data-index="${placeholderIndex}"></kbd>` +
                        processed.substring(matchInfo.end)
                })

            return {
                processedContent: processed,
                placeholders: foundPlaceholders,
            }
        }, [content])

        return (
            <ToolbarProvider
                guidanceVariables={guidanceVariables}
                guidanceActions={guidanceActions}
                shopName={shopName}
            >
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        kbd: (
                            props: React.HTMLAttributes<HTMLElement> & {
                                'data-index'?: string
                            },
                        ) => {
                            const dataIndex = props['data-index']
                            const index = parseInt(dataIndex as string)
                            const placeholder = placeholders[index]

                            if (!placeholder) return null

                            switch (placeholder.type) {
                                case PlaceholderType.VARIABLE:
                                    return (
                                        <GuidanceVariableTag
                                            key={`var-${index}`}
                                            value={placeholder.value}
                                            size="normal"
                                        >
                                            {null}
                                        </GuidanceVariableTag>
                                    )
                                case PlaceholderType.ACTION:
                                    return (
                                        <GuidanceActionTag
                                            key={`action-${index}`}
                                            value={placeholder.value}
                                        >
                                            {null}
                                        </GuidanceActionTag>
                                    )
                                default:
                                    return null
                            }
                        },
                    }}
                >
                    {processedContent}
                </ReactMarkdown>
            </ToolbarProvider>
        )
    },
)

KnowledgeSourcePreviewContentRenderer.displayName =
    'KnowledgeSourcePreviewContentRenderer'
