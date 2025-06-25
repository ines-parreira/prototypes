import React, { useEffect, useState } from 'react'

import { Label, Tooltip } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
import { useSearchParam } from 'hooks/useSearchParam'
import { useIngestionDomainBannerDismissed } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'
import Button from 'pages/common/components/button/Button'
import useHelpCenterCustomDomainHostnames from 'pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    ARTICLE_INGESTION_LOGS_STATUS,
    WIZARD_POST_COMPLETION_QUERY_KEY,
    WIZARD_POST_COMPLETION_STATE,
} from '../../constants'
import { usePublicResourceMutation } from '../../hooks/usePublicResourcesMutation'
import { usePublicResourcesPooling } from '../../hooks/usePublicResourcesPooling'
import { PublicSourcesItem } from './PublicSourcesItem'
import { SourceItem } from './types'

import css from './PublicSourcesSection.less'

const SOURCES_LIMIT = 10

type Props = {
    helpCenterId: number
    shopName: string
    onPublicURLsChanged: (publicURLs: string[]) => void
    sourceItems?: SourceItem[]
    selectedHelpCenterId?: number
    logConnectedPublicUrl?: (url: string) => void
    setPendingResourcesCount?: (pendingResourcesCount: number) => void
    setIsSuccessResources?: (isSuccessResources: boolean) => void
    setIsFailedResources?: (isFailedResources: boolean) => void
    setIsPristine?: (isPristine: boolean) => void
    syncUrlOnCommand?: boolean
    setSyncUrlOnCommand?: (syncUrlOnCommand: boolean) => void
}

export const PublicSourcesSection = ({
    helpCenterId,
    shopName,
    onPublicURLsChanged,
    sourceItems,
    selectedHelpCenterId,
    logConnectedPublicUrl,
    setPendingResourcesCount,
    setIsSuccessResources,
    setIsFailedResources,
    setIsPristine,
    syncUrlOnCommand,
    setSyncUrlOnCommand,
}: Props) => {
    const dispatch = useAppDispatch()
    const [wizardQueryParam] = useSearchParam(WIZARD_POST_COMPLETION_QUERY_KEY)

    const { articleIngestionLogsStatus } = usePublicResourcesPooling({
        helpCenterId,
        shopName,
    })

    const { resetAllBanner } = useIngestionDomainBannerDismissed({
        shopName,
    })

    useEffect(() => {
        const pendingResourcesCount = articleIngestionLogsStatus.filter(
            (status) => status === ARTICLE_INGESTION_LOGS_STATUS.PENDING,
        ).length

        if (setPendingResourcesCount) {
            setPendingResourcesCount(pendingResourcesCount)
        }

        const isPostCompletionWizardPage =
            wizardQueryParam === WIZARD_POST_COMPLETION_STATE.knowledge

        if (isPostCompletionWizardPage && !pendingResourcesCount) {
            const isSuccessResources = articleIngestionLogsStatus.every(
                (status) => status === ARTICLE_INGESTION_LOGS_STATUS.SUCCESSFUL,
            )

            if (isSuccessResources) {
                setIsSuccessResources && setIsSuccessResources(true)
            } else {
                setIsFailedResources && setIsFailedResources(true)
            }
        }
    }, [
        articleIngestionLogsStatus,
        wizardQueryParam,
        setPendingResourcesCount,
        setIsFailedResources,
        setIsSuccessResources,
    ])

    const { deletePublicResource, addPublicResource } =
        usePublicResourceMutation({ helpCenterId })
    const [sources, setSources] = useState<SourceItem[]>(sourceItems ?? [])

    useEffect(() => {
        setSources(sourceItems ?? [])
    }, [sourceItems])

    const handleChangePublicResource = (sources: SourceItem[]) => {
        const publicURLs = sources
            .map((source) => source.url)
            .filter((url): url is string => !!url)

        onPublicURLsChanged(publicURLs)
    }

    const onAddClick = () => {
        const newResource: SourceItem = {
            id: Math.random(),
            status: 'idle',
            createdDatetime: new Date().toISOString(),
        }
        const newSources = [...sources, newResource]
        setSources(newSources)
    }

    const onDeleteSource = async (source: SourceItem) => {
        const newSources = sources.filter((s) => s.id !== source.id)
        setSources(newSources)
        handleChangePublicResource(newSources)

        if (source.status === 'idle') return

        try {
            await deletePublicResource(source.id)

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Public URL successfully deleted',
                }),
            )
        } catch {
            setSources((prev) => [...prev, source])
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Error during Public URL deletion. Try one more time or contact support',
                }),
            )
        }
    }

    const onSyncSource = async (url: string, sourceId: number) => {
        try {
            const newSources: SourceItem[] = sources.map((source) =>
                source.id === sourceId
                    ? { ...source, status: 'loading', url }
                    : { ...source },
            )

            setSources(newSources)
            handleChangePublicResource(newSources)
            if (logConnectedPublicUrl) {
                logConnectedPublicUrl(url)
            }
            await addPublicResource([url])
            resetAllBanner()
        } catch {
            setSources((prev) =>
                prev.map((source) =>
                    source.id === sourceId
                        ? { ...source, status: 'error' }
                        : { ...source },
                ),
            )

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'We couldn’t sync your URL. Please try again or contact support if the issue persists.',
                }),
            )
        }
    }

    const isLimitReached = sources.length >= SOURCES_LIMIT
    const existingUrls = sources
        .map((s) => s.url)
        .filter((url): url is string => !!url)

    const { customDomainHostnames } =
        useHelpCenterCustomDomainHostnames(selectedHelpCenterId)

    return (
        <div className={css.container}>
            <div>
                <Label className={css.title}>Single page URLs</Label>
                <div className={css.description}>
                    Add up to 10 URLs for AI Agent to use as knowledge. Only
                    content from each page is used—subpages and media are
                    excluded. Gorgias Help Center and store website links are
                    not supported.
                </div>
            </div>

            {sources.length > 0 && (
                <ul className={css.list}>
                    {sources.map((source) => (
                        <li key={source.id}>
                            <PublicSourcesItem
                                existingUrls={existingUrls}
                                source={source}
                                onDelete={onDeleteSource}
                                onSync={onSyncSource}
                                helpCenterCustomDomains={customDomainHostnames}
                                setIsPristine={setIsPristine}
                                syncUrlOnCommand={syncUrlOnCommand}
                                setSyncUrlOnCommand={setSyncUrlOnCommand}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <div>
                {isLimitReached && (
                    <Tooltip target="add-button">
                        You have reached the maximum number of URLs allowed
                    </Tooltip>
                )}

                <Button
                    id="add-button"
                    intent="secondary"
                    onClick={onAddClick}
                    isDisabled={isLimitReached}
                    leadingIcon="add"
                >
                    Add URL
                </Button>
            </div>
        </div>
    )
}
