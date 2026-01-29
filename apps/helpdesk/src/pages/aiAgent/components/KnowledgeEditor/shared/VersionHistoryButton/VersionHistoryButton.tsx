import { useCallback, useMemo } from 'react'

import {
    Box,
    Button,
    Heading,
    ListItem,
    Select,
    Skeleton,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import type { VersionHistoryButtonProps, VersionItem } from './types'

type VersionOption<V extends VersionItem> = {
    id: string
    value: string
    label: string
    version: V
}

function formatDate(dateString: string | null): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return `${text.slice(0, maxLength)}...`
}

function formatVersionLabel(version: VersionItem, isCurrent: boolean): string {
    const parts: string[] = [`Version ${version.version}`]
    if (isCurrent) {
        parts.push('(Current)')
    }
    if (version.commit_message) {
        parts.push(`- ${truncateText(version.commit_message, 25)}`)
    }
    if (version.published_datetime) {
        parts.push(`• ${formatDate(version.published_datetime)}`)
    }
    return parts.join(' ')
}

export function VersionHistoryButton<V extends VersionItem>({
    versions,
    isLoading,
    currentVersionId,
    selectedVersionId,
    onSelectVersion,
    isDisabled,
    isFetchingNextPage,
    onLoadMore,
    shouldLoadMore,
}: VersionHistoryButtonProps<V>) {
    const items: VersionOption<V>[] = useMemo(
        () =>
            versions.map((version) => {
                const id = String(version.id)
                const label = formatVersionLabel(
                    version,
                    version.id === currentVersionId,
                )
                return {
                    id,
                    value: id,
                    label,
                    version,
                }
            }),
        [versions, currentVersionId],
    )

    const currentlySelectedVersionId =
        selectedVersionId ?? currentVersionId ?? null

    const selectedItem = useMemo(
        () =>
            items.find(
                (item) => item.id === String(currentlySelectedVersionId),
            ) ?? null,
        [items, currentlySelectedVersionId],
    )

    const handleSelect = useCallback(
        (option: VersionOption<V>) => {
            const selectedItem = items.find(
                (item) => item.id.toString() === option?.id.toString(),
            )

            if (selectedItem) {
                onSelectVersion(selectedItem.version)
            }
        },
        [onSelectVersion, items],
    )

    const trigger = ({ ref }: { ref: React.Ref<HTMLButtonElement> }) => {
        const button = (
            <Button
                ref={ref}
                slot="button"
                variant="secondary"
                icon="history"
                isDisabled={isDisabled || versions.length === 0}
                aria-label="Version history"
            />
        )

        if (isDisabled || versions.length === 0) {
            return button
        }

        return (
            <Tooltip placement="bottom">
                <TooltipTrigger>{button}</TooltipTrigger>
                <TooltipContent title="Version history" />
            </Tooltip>
        )
    }

    if (isLoading) {
        return <Skeleton width={36} height={36} />
    }

    if (versions.length === 0) {
        return null
    }

    return (
        <Select<VersionOption<V>>
            trigger={trigger}
            items={items}
            selectedItem={selectedItem}
            onSelect={handleSelect}
            aria-label="Select version"
            placement="bottom right"
            maxWidth={340}
            minWidth={340}
            maxHeight={400}
            onLoadMore={shouldLoadMore ? onLoadMore : undefined}
            isLoading={isFetchingNextPage}
            header={
                <Box
                    flexDirection="column"
                    gap="xxxs"
                    padding="sm"
                    paddingBottom="xs"
                >
                    <Heading size="sm">Version History</Heading>
                    <Text size="sm" color="secondary">
                        Select a version to preview
                    </Text>
                </Box>
            }
        >
            {(option: VersionOption<V>) => (
                <ListItem
                    key={option.id}
                    textValue={option.label}
                    label={option.label}
                />
            )}
        </Select>
    )
}
