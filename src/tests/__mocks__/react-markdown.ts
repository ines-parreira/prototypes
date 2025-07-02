import React from 'react'

const ReactMarkdown = ({
    children,
    components,
}: {
    children: string
    components?: any
}) => {
    // Simple mock that processes components for testing
    if (components?.kbd && children.includes('<kbd')) {
        // Process <kbd> elements and call the component
        const kbdMatches = children.match(/<kbd id="(\d+)" \/>/g) || []
        let elements: React.ReactNode[] = []
        let lastIndex = 0

        kbdMatches.forEach((match) => {
            const matchIndex = children.indexOf(match, lastIndex)

            // Add text before the match
            if (matchIndex > lastIndex) {
                elements.push(children.substring(lastIndex, matchIndex))
            }

            const idMatch = match.match(/id="(\d+)"/)
            if (idMatch) {
                const id = idMatch[1]
                try {
                    const kbdComponent = components.kbd({ id })
                    // Render the actual component
                    if (kbdComponent) {
                        elements.push(
                            React.cloneElement(kbdComponent, {
                                key: `kbd-${id}`,
                            }),
                        )
                    }
                } catch (e) {
                    // If component rendering fails, add placeholder
                    elements.push(`[KBD_ERROR_${id}]`)
                    console.error(e)
                }
            }

            lastIndex = matchIndex + match.length
        })

        // Add remaining text
        if (lastIndex < children.length) {
            elements.push(children.substring(lastIndex))
        }

        return React.createElement(
            'div',
            {
                'data-testid': 'react-markdown',
            },
            ...elements,
        )
    }

    return React.createElement(
        'div',
        { 'data-testid': 'react-markdown' },
        children,
    )
}

export default ReactMarkdown
