import { useLocalStorage } from '@repo/hooks'

import { DisclosureGroup } from '@gorgias/axiom'

export type NavigationSectionGroupProps = {
    children: React.ReactNode
    storageKey: string
    defaultExpandedKeys?: string[]
}

export function NavigationSectionGroup({
    children,
    storageKey,
    defaultExpandedKeys = [],
}: NavigationSectionGroupProps) {
    const [expandedKeys, setExpandedKeys] = useLocalStorage(
        `${storageKey}:expanded-sections`,
        defaultExpandedKeys,
    )

    return (
        <DisclosureGroup
            gap="xs"
            allowsMultipleExpanded
            expandedKeys={expandedKeys ?? []}
            onExpandedChange={(keys) => setExpandedKeys([...keys] as string[])}
        >
            {children}
        </DisclosureGroup>
    )
}
