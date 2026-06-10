import { useLocalStorage } from '@gorgias/toolkit-react'

import { DisclosureGroup } from '@gorgias/axiom'

type UncontrolledProps = {
    children: React.ReactNode
    storageKey: string
    defaultExpandedKeys?: string[]
    expandedKeys?: never
    onExpandedChange?: never
}

type ControlledProps = {
    children: React.ReactNode
    expandedKeys: string[]
    onExpandedChange: (keys: string[]) => void
    storageKey?: never
    defaultExpandedKeys?: never
}

export type NavigationSectionGroupProps = UncontrolledProps | ControlledProps

export function NavigationSectionGroup(props: NavigationSectionGroupProps) {
    if ('expandedKeys' in props && props.expandedKeys !== undefined) {
        return (
            <DisclosureGroup
                gap="xs"
                allowsMultipleExpanded
                expandedKeys={props.expandedKeys}
                onExpandedChange={(keys) =>
                    props.onExpandedChange([...keys] as string[])
                }
            >
                {props.children}
            </DisclosureGroup>
        )
    }

    return (
        <UncontrolledNavigationSectionGroup
            storageKey={props.storageKey}
            defaultExpandedKeys={props.defaultExpandedKeys}
        >
            {props.children}
        </UncontrolledNavigationSectionGroup>
    )
}

function UncontrolledNavigationSectionGroup({
    children,
    storageKey,
    defaultExpandedKeys = [],
}: UncontrolledProps) {
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
