import {Label, Tooltip} from '@gorgias/merchant-ui-kit'
import React, {useEffect, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import {useSearchParam} from 'hooks/useSearchParam'
import Button from 'pages/common/components/button/Button'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import useHelpCenterCustomDomainHostnames from 'pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import {
    ARTICLE_INGESTION_LOGS_STATUS,
    WIZARD_POST_COMPLETION_QUERY_KEY,
    WIZARD_POST_COMPLETION_STATE,
} from '../../constants'
import {usePublicResourceMutation} from '../../hooks/usePublicResourcesMutation'
import {usePublicResourcesPooling} from '../../hooks/usePublicResourcesPooling'
import {PublicSourcesItem} from './PublicSourcesItem'
import css from './PublicSourcesSection.less'
import {SourceItem} from './types'
import {mergeSources} from './utils'

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

    const {articleIngestionLogsStatus} = usePublicResourcesPooling({
        helpCenterId,
        shopName,
    })

    useEffect(() => {
        const pendingResourcesCount = articleIngestionLogsStatus.filter(
            (status) => status === ARTICLE_INGESTION_LOGS_STATUS.PENDING
        ).length

        if (setPendingResourcesCount) {
            setPendingResourcesCount(pendingResourcesCount)
        }

        const isPostCompletionWizardPage =
            wizardQueryParam === WIZARD_POST_COMPLETION_STATE.knowledge

        if (isPostCompletionWizardPage && !pendingResourcesCount) {
            const isSuccessResources = articleIngestionLogsStatus.every(
                (status) => status === ARTICLE_INGESTION_LOGS_STATUS.SUCCESSFUL
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

    const {deletePublicResource, addPublicResource} = usePublicResourceMutation(
        {helpCenterId}
    )
    const [sources, setSources] = useState<SourceItem[]>(sourceItems ?? [])

    useEffect(() => {
        if (sourceItems) {
            setSources((prevSources) => mergeSources(prevSources, sourceItems))
        }
    }, [sourceItems])

    const handleAddPublicResource = (sources: SourceItem[]) => {
        const publicURLs = sources
            .map((source) => source.url)
            .filter((url): url is string => !!url)

        onPublicURLsChanged(publicURLs)
    }

    const onAddClick = () => {
        const newResource: SourceItem = {
            id: Math.random(),
            status: 'idle',
        }
        const newSources = [...sources, newResource]
        setSources(newSources)
    }

    const onDeleteSource = async (source: SourceItem) => {
        const newSources = sources.filter((s) => s.id !== source.id)
        setSources(newSources)
        handleAddPublicResource(newSources)

        if (source.status === 'idle') return

        try {
            await deletePublicResource(source.id)

            void dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Public URL successfully deleted',
                })
            )
        } catch (error) {
            setSources((prev) => [...prev, source])
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Error during Public URL deletion. Try one more time or contact support',
                })
            )
        }
    }

    const onSyncSource = async (url: string, sourceId: number) => {
        try {
            const newSources: SourceItem[] = sources.map((source) =>
                source.id === sourceId
                    ? {...source, status: 'loading', url}
                    : {...source}
            )

            setSources(newSources)
            handleAddPublicResource(newSources)
            if (logConnectedPublicUrl) {
                logConnectedPublicUrl(url)
            }
            await addPublicResource([url])
        } catch (error) {
            setSources((prev) =>
                prev.map((source) =>
                    source.id === sourceId
                        ? {...source, status: 'error'}
                        : {...source}
                )
            )

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Error during Public URL sync. Try different URL or contact support',
                })
            )
        }
    }

    const isLimitReached = sources.length >= SOURCES_LIMIT
    const existingUrls = sources
        .map((s) => s.url)
        .filter((url): url is string => !!url)

    const {customDomainHostnames} =
        useHelpCenterCustomDomainHostnames(selectedHelpCenterId)

    return (
        <div className={css.container}>
            <div>
                <Label className={css.title}>
                    Public URL sources
                    <IconTooltip
                        className={css.icon}
                        tooltipProps={{
                            placement: 'top-start',
                        }}
                    >
                        Example sources: "<u>https://yourstore.com/faqs</u>" or
                        "<u>https://yourstore.com/return-policy</u>". Please
                        note that image, tables and video content will be
                        ignored.
                    </IconTooltip>
                </Label>
                <div>
                    Add external URLs for AI Agent to reference. Links to your
                    Gorgias Help Center or main domain are not accepted, as AI
                    Agent needs specific pages to provide accurate answers.
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
                        You have reached the maximum number of URLs.
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
