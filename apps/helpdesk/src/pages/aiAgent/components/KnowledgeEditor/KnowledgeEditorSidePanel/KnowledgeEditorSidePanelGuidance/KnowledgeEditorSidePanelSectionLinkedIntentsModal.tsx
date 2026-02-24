import { useEffect, useMemo, useRef, useState } from 'react'

import { useShallow } from 'zustand/react/shallow'

import {
    Box,
    Button,
    CheckBoxField,
    Icon,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    SearchField,
    Skeleton,
    Text,
} from '@gorgias/axiom'

import { useGetArticleTranslationIntents } from 'models/helpCenter/queries'
import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'
import type { Components } from 'rest_api/help_center_api/client.generated'

import css from './KnowledgeEditorSidePanelSectionLinkedIntents.less'

type ApiIntent = Components.Schemas.ArticleTranslationIntentDto

export type LinkedIntentGroup = Omit<
    Components.Schemas.ArticleTranslationIntentGroupDto,
    'children'
> & {
    children: ApiIntent[]
}

export type LinkedIntent = ApiIntent & {
    groupName: string
}

type Props = {
    isOpen: boolean
    selectedIntentIds: string[]
    onClose: () => void
    onSave: (nextLinkedIntents: LinkedIntent[]) => void
}

const createDefaultExpandedGroups = (groups: LinkedIntentGroup[]) =>
    groups.reduce<Record<string, boolean>>((acc, group, index) => {
        acc[group.name] = index === 0
        return acc
    }, {})

const normalizeString = (value: string) => value.trim().toLowerCase()

const IntentRowSkeleton = () => (
    <div className={css.intentRowSkeleton}>
        <div className={css.intentInfoSkeleton}>
            <Skeleton width={24} height={24} />
            <Skeleton width={240} height={24} />
        </div>
        <Skeleton width={72} height={20} />
    </div>
)

const LinkedIntentsLoadingSkeleton = () => (
    <div className={css.loadingState} aria-label="Loading intents">
        <div className={css.suggestedSection}>
            <div className={css.suggestedHeader}>
                <Skeleton width={16} height={16} />
                <Skeleton width={150} height={20} />
            </div>
            <div className={css.suggestedList}>
                <IntentRowSkeleton />
                <IntentRowSkeleton />
            </div>
        </div>

        <div className={css.group}>
            <div className={css.groupHeader}>
                <div className={css.intentInfoSkeleton}>
                    <Skeleton width={24} height={24} />
                    <Skeleton width={120} height={24} />
                </div>
                <Skeleton width={24} height={24} />
            </div>
            <div className={css.groupItems}>
                <IntentRowSkeleton />
                <IntentRowSkeleton />
                <IntentRowSkeleton />
            </div>
        </div>

        <div className={css.group}>
            <div className={css.groupHeader}>
                <div className={css.intentInfoSkeleton}>
                    <Skeleton width={24} height={24} />
                    <Skeleton width={140} height={24} />
                </div>
                <Skeleton width={24} height={24} />
            </div>
        </div>
    </div>
)

export const KnowledgeEditorSidePanelSectionLinkedIntentsModal = ({
    isOpen,
    selectedIntentIds,
    onClose,
    onSave,
}: Props) => {
    const { guidanceArticleId, guidanceArticleLocale, guidanceHelpCenterId } =
        useGuidanceStore(
            useShallow((storeState) => ({
                guidanceArticleId: storeState.guidanceArticle?.id,
                guidanceArticleLocale: storeState.guidanceArticle?.locale,
                guidanceHelpCenterId: storeState.config.guidanceHelpCenter?.id,
            })),
        )

    const areIntentPathParamsReady =
        guidanceHelpCenterId !== undefined &&
        guidanceArticleId !== undefined &&
        guidanceArticleLocale !== undefined

    const {
        data: articleTranslationIntents,
        isLoading: isLoadingIntents,
        isError: isIntentsError,
        refetch: onRetryLoadIntents,
    } = useGetArticleTranslationIntents(
        {
            help_center_id: guidanceHelpCenterId ?? 0,
            article_id: guidanceArticleId ?? 0,
            locale: guidanceArticleLocale ?? '',
        },
        {
            enabled: isOpen && areIntentPathParamsReady,
        },
    )

    const intentGroups = articleTranslationIntents?.intents
    const groups = useMemo(() => intentGroups ?? [], [intentGroups])

    const [searchValue, setSearchValue] = useState('')
    const [draftIntentIds, setDraftIntentIds] = useState<string[]>(
        () => selectedIntentIds,
    )
    const [expandedGroups, setExpandedGroups] = useState<
        Record<string, boolean>
    >({})
    const wasOpenRef = useRef(isOpen)

    useEffect(() => {
        if (isOpen && !wasOpenRef.current) {
            setDraftIntentIds(selectedIntentIds)
            setSearchValue('')
            setExpandedGroups({})
        }

        wasOpenRef.current = isOpen
    }, [isOpen, selectedIntentIds])

    const defaultExpandedGroups = useMemo(
        () => createDefaultExpandedGroups(groups),
        [groups],
    )

    const getIsGroupExpanded = (groupName: string) =>
        Boolean(expandedGroups[groupName] ?? defaultExpandedGroups[groupName])

    const allIntents = useMemo<LinkedIntent[]>(
        () =>
            groups.flatMap((group) =>
                group.children.map((intent) => ({
                    ...intent,
                    groupName: group.name,
                })),
            ),
        [groups],
    )

    const intentsById = useMemo(
        () =>
            allIntents.reduce<Record<string, LinkedIntent>>((acc, intent) => {
                acc[intent.intent] = intent
                return acc
            }, {}),
        [allIntents],
    )

    const filteredGroups = useMemo(() => {
        const trimmedSearchValue = normalizeString(searchValue)
        if (!trimmedSearchValue) {
            return groups
        }

        return groups
            .map((group) => ({
                ...group,
                children: group.children.filter((intent) => {
                    const normalizedIntentName = normalizeString(intent.name)
                    const normalizedIntentKey = normalizeString(intent.intent)
                    return (
                        normalizedIntentName.includes(trimmedSearchValue) ||
                        normalizedIntentKey.includes(trimmedSearchValue)
                    )
                }),
            }))
            .filter((group) => group.children.length > 0)
    }, [groups, searchValue])

    const suggestedIntents = useMemo(() => {
        if (searchValue.trim().length > 0) {
            return []
        }

        return allIntents.filter((intent) => intent.is_available).slice(0, 2)
    }, [allIntents, searchValue])

    const handleModalOpenChange = (nextIsOpen: boolean) => {
        if (!nextIsOpen) {
            onClose()
        }
    }

    const toggleIntent = (intent: ApiIntent) => {
        if (!intent.is_available) {
            return
        }

        setDraftIntentIds((previousDraftIntentIds) =>
            previousDraftIntentIds.includes(intent.intent)
                ? previousDraftIntentIds.filter((id) => id !== intent.intent)
                : [...previousDraftIntentIds, intent.intent],
        )
    }

    const toggleGroupIntents = (group: LinkedIntentGroup) => {
        const availableIntentIds = group.children
            .filter((intent) => intent.is_available)
            .map((intent) => intent.intent)

        if (availableIntentIds.length === 0) {
            return
        }

        const areAllAvailableIntentsSelected = availableIntentIds.every((id) =>
            draftIntentIds.includes(id),
        )

        setDraftIntentIds((previousDraftIntentIds) => {
            if (areAllAvailableIntentsSelected) {
                return previousDraftIntentIds.filter(
                    (id) => !availableIntentIds.includes(id),
                )
            }

            return Array.from(
                new Set([...previousDraftIntentIds, ...availableIntentIds]),
            )
        })
    }

    const handleSave = () => {
        const selectedIntents = draftIntentIds
            .map((intentId) => intentsById[intentId])
            .filter((intent): intent is LinkedIntent => intent !== undefined)

        onSave(selectedIntents)
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleModalOpenChange}
            size="sm"
            aria-label="Link intents"
        >
            <OverlayHeader title="Link intents" />
            <OverlayContent width="100%" flexGrow={1} minHeight={0}>
                <Box
                    className={css.modalContent}
                    flexDirection="column"
                    gap="sm"
                    width="100%"
                    height="100%"
                >
                    <Text size="md">
                        AI Agent will only use this guidance to respond to the
                        linked intents, improving response quality and
                        preventing contradictions.
                    </Text>
                    <SearchField
                        value={searchValue}
                        onChange={setSearchValue}
                        onClear={() => setSearchValue('')}
                        placeholder="Search..."
                        aria-label="Search intents"
                    />
                    <Text size="sm" className={css.selectionCount}>
                        {draftIntentIds.length} of {allIntents.length} intents
                        selected
                    </Text>

                    <div className={css.intentsContainer}>
                        {isLoadingIntents && <LinkedIntentsLoadingSkeleton />}

                        {!isLoadingIntents && isIntentsError && (
                            <div className={css.errorState}>
                                <Text size="sm">
                                    We could not load intents.
                                </Text>
                                <Button
                                    size="sm"
                                    variant="tertiary"
                                    onClick={() => onRetryLoadIntents()}
                                >
                                    Try again
                                </Button>
                            </div>
                        )}

                        {!isLoadingIntents &&
                            !isIntentsError &&
                            suggestedIntents.length > 0 && (
                                <div className={css.suggestedSection}>
                                    <div className={css.suggestedHeader}>
                                        <Icon name="light-bulb" />
                                        <Text
                                            size="sm"
                                            className={css.suggestedTitle}
                                        >
                                            Suggested intents
                                        </Text>
                                    </div>
                                    <div className={css.suggestedList}>
                                        {suggestedIntents.map((intent) => (
                                            <div
                                                className={css.intentRow}
                                                key={`suggested-${intent.intent}`}
                                            >
                                                <CheckBoxField
                                                    label={intent.name}
                                                    value={draftIntentIds.includes(
                                                        intent.intent,
                                                    )}
                                                    onChange={() =>
                                                        toggleIntent(intent)
                                                    }
                                                    isDisabled={
                                                        !intent.is_available
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {!isLoadingIntents &&
                            !isIntentsError &&
                            filteredGroups.map((group) => {
                                const availableIntentIds = group.children
                                    .filter((intent) => intent.is_available)
                                    .map((intent) => intent.intent)

                                const selectedCount = availableIntentIds.filter(
                                    (id) => draftIntentIds.includes(id),
                                ).length

                                const isGroupExpanded =
                                    searchValue.trim().length > 0
                                        ? true
                                        : getIsGroupExpanded(group.name)

                                return (
                                    <div className={css.group} key={group.name}>
                                        <div className={css.groupHeader}>
                                            <CheckBoxField
                                                label={group.name}
                                                value={
                                                    availableIntentIds.length >
                                                        0 &&
                                                    selectedCount ===
                                                        availableIntentIds.length
                                                }
                                                isIndeterminate={
                                                    selectedCount > 0 &&
                                                    selectedCount <
                                                        availableIntentIds.length
                                                }
                                                onChange={() =>
                                                    toggleGroupIntents(group)
                                                }
                                                isDisabled={
                                                    availableIntentIds.length ===
                                                    0
                                                }
                                            />
                                            {searchValue.trim().length ===
                                                0 && (
                                                <Button
                                                    size="sm"
                                                    variant="tertiary"
                                                    onClick={() =>
                                                        setExpandedGroups(
                                                            (
                                                                previousExpandedGroups,
                                                            ) => ({
                                                                ...previousExpandedGroups,
                                                                [group.name]:
                                                                    !previousExpandedGroups[
                                                                        group
                                                                            .name
                                                                    ],
                                                            }),
                                                        )
                                                    }
                                                    aria-label={`Toggle ${group.name} intents`}
                                                >
                                                    <Icon
                                                        name={
                                                            isGroupExpanded
                                                                ? 'arrow-chevron-up'
                                                                : 'arrow-chevron-down'
                                                        }
                                                    />
                                                </Button>
                                            )}
                                        </div>

                                        {isGroupExpanded && (
                                            <div className={css.groupItems}>
                                                {group.children.map(
                                                    (intent) => (
                                                        <div
                                                            className={
                                                                css.intentRow
                                                            }
                                                            key={`${group.name}-${intent.intent}`}
                                                        >
                                                            <CheckBoxField
                                                                label={
                                                                    intent.name
                                                                }
                                                                caption={
                                                                    !intent.is_available &&
                                                                    intent.used_by_article
                                                                        ? 'Already linked to another guidance'
                                                                        : undefined
                                                                }
                                                                value={draftIntentIds.includes(
                                                                    intent.intent,
                                                                )}
                                                                onChange={() =>
                                                                    toggleIntent(
                                                                        intent,
                                                                    )
                                                                }
                                                                isDisabled={
                                                                    !intent.is_available
                                                                }
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                    </div>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button variant="tertiary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        isDisabled={isLoadingIntents}
                    >
                        Save
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
