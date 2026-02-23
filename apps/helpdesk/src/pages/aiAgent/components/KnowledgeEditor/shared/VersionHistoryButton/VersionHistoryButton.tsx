import { useCallback, useMemo, useRef } from 'react'

import { DateAndTimeFormatting, formatDatetime } from '@repo/utils'

import {
    Box,
    Button,
    ListItem,
    Select,
    Skeleton,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { useIsTruncated } from 'pages/common/hooks/useIsTruncated'
import {
    getDateAndTimeFormatter,
    getTimezone,
} from 'state/currentUser/selectors'

import type { VersionHistoryButtonProps, VersionItem } from './types'
import { useVersionUsers } from './useVersionUsers'

import css from './VersionHistoryButton.less'

type VersionOption<V extends VersionItem> = {
    id: string
    value: string
    version: V
}

type LoadingOption = {
    id: string
    value: string
    isLoadingOption: true
}

type SelectOption<V extends VersionItem> = VersionOption<V> | LoadingOption

const LOADING_OPTIONS: LoadingOption[] = [
    {
        id: 'loading-option-1',
        value: 'loading-option-1',
        isLoadingOption: true,
    },
    {
        id: 'loading-option-2',
        value: 'loading-option-2',
        isLoadingOption: true,
    },
    {
        id: 'loading-option-3',
        value: 'loading-option-3',
        isLoadingOption: true,
    },
]

function buildVersionLabel(
    version: VersionItem,
    isCurrent: boolean,
    formatDate: (dateString: string) => string,
): string {
    const isDraft = version.published_datetime === null
    const dateSource = version.published_datetime ?? version.created_datetime
    const dateText = dateSource ? formatDate(dateSource) : ''
    const parts: string[] = [dateText || `Version ${version.version}`]
    if (isDraft) {
        parts.push('(draft edits)')
    } else if (isCurrent) {
        parts.push('(current)')
    }
    return parts.join(' ')
}

function buildCaptionText(
    version: VersionItem,
    userName: string | undefined,
): string | undefined {
    const commitMessage = version.commit_message

    if (!userName && !commitMessage) return undefined

    if (!commitMessage) {
        return userName
    }

    return userName ? `${userName}: ${commitMessage}` : commitMessage
}

function VersionCaption({
    version,
    userName,
}: {
    version: VersionItem
    userName: string | undefined
}) {
    const textRef = useRef<HTMLDivElement>(null)
    const commitMessage = version.commit_message
    const fullText = buildCaptionText(version, userName)
    const isTruncated = useIsTruncated(textRef, fullText)

    if (!fullText) return null

    return (
        <Tooltip delay={300} placement="bottom left" isDisabled={!isTruncated}>
            <TooltipTrigger>
                <div ref={textRef} className={css.caption}>
                    <Text size="sm" variant="regular">
                        <Text as="span" size="sm" variant="bold">
                            {userName}
                        </Text>
                        {commitMessage ? `: ${commitMessage}` : ''}
                    </Text>
                </div>
            </TooltipTrigger>
            <TooltipContent title={fullText} />
        </Tooltip>
    )
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
    const timezone = useAppSelector(getTimezone)
    const dateAndTimeFormatter = useAppSelector(getDateAndTimeFormatter)
    const { userNames, isLoading: isLoadingUsers } = useVersionUsers(versions)
    const isSelectLoading = isLoading || isLoadingUsers

    const formatDate = useCallback(
        (dateString: string) =>
            formatDatetime(
                dateString,
                dateAndTimeFormatter(DateAndTimeFormatting.CompactDateWithTime),
                timezone,
            ),
        [dateAndTimeFormatter, timezone],
    )

    const versionItems: VersionOption<V>[] = useMemo(
        () =>
            versions.map((version) => ({
                id: String(version.id),
                value: String(version.id),
                version,
            })),
        [versions],
    )

    const items: SelectOption<V>[] = useMemo(
        () => (isSelectLoading ? LOADING_OPTIONS : versionItems),
        [isSelectLoading, versionItems],
    )

    const currentlySelectedVersionId =
        selectedVersionId ?? currentVersionId ?? null

    const hasOnlyUnpublishedDraft =
        versions.length === 1 &&
        versions[0].published_datetime === null &&
        currentVersionId === null

    const selectedItem = useMemo(() => {
        if (isSelectLoading) {
            return null
        }

        return (
            versionItems.find(
                (item) => item.id === String(currentlySelectedVersionId),
            ) ?? null
        )
    }, [isSelectLoading, versionItems, currentlySelectedVersionId])

    const handleSelect = useCallback(
        (option: SelectOption<V>) => {
            if (!('version' in option)) {
                return
            }

            const selectedItem = versionItems.find(
                (item) => item.id.toString() === option?.id.toString(),
            )

            if (selectedItem) {
                onSelectVersion(selectedItem.version)
            }
        },
        [onSelectVersion, versionItems],
    )

    const trigger = ({ ref }: { ref?: React.Ref<HTMLButtonElement> }) => {
        const button = (
            <Button
                ref={ref}
                variant="secondary"
                icon="history"
                isDisabled={isDisabled}
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

    if (
        !isSelectLoading &&
        (versions.length === 0 || hasOnlyUnpublishedDraft)
    ) {
        return null
    }

    return (
        <Select<SelectOption<V>>
            // we need to remount the list whenever we change our currentVersionId because we are statically rendering the items
            // on component mount
            key={currentlySelectedVersionId}
            trigger={trigger}
            items={items}
            selectedItem={selectedItem}
            onSelect={handleSelect}
            aria-label="Select version"
            placement="bottom right"
            maxWidth={340}
            minWidth={340}
            maxHeight={400}
            onLoadMore={
                !isSelectLoading && shouldLoadMore ? onLoadMore : undefined
            }
            isLoading={isSelectLoading || isFetchingNextPage}
            header={
                <Box
                    flexDirection="column"
                    gap="xxxs"
                    padding="sm"
                    paddingBottom="xs"
                >
                    <Text size="sm" color="secondary">
                        Select a version to preview
                    </Text>
                </Box>
            }
        >
            {(option: SelectOption<V>) => {
                if (!('version' in option)) {
                    return (
                        <ListItem
                            isDisabled
                            label={<Skeleton width={180} height={16} />}
                            caption={<Skeleton width={220} height={12} />}
                            textValue="Loading version"
                        />
                    )
                }

                const { version } = option
                const isCurrent = version.id === currentVersionId
                const userName = version.publisher_user_id
                    ? userNames.get(version.publisher_user_id)
                    : undefined
                const label = buildVersionLabel(version, isCurrent, formatDate)
                const captionText = buildCaptionText(version, userName)

                return (
                    <ListItem
                        label={
                            <Text size="md" variant="regular">
                                {label}
                            </Text>
                        }
                        caption={
                            <VersionCaption
                                version={version}
                                userName={userName}
                            />
                        }
                        textValue={[label, captionText]
                            .filter(Boolean)
                            .join(' ')}
                    />
                )
            }}
        </Select>
    )
}
