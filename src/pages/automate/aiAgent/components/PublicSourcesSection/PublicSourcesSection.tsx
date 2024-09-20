import React, {useEffect, useState} from 'react'
import {Label, Tooltip} from '@gorgias/ui-kit'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import useHelpCenterCustomDomainHostnames from 'pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames'
import {logEvent, SegmentEvent} from 'common/segment'
import {usePublicResourceMutation} from '../../hooks/usePublicResourcesMutation'
import {usePublicResourcesPooling} from '../../hooks/usePublicResourcesPooling'
import css from './PublicSourcesSection.less'
import {PublicSourcesItem} from './PublicSourcesItem'
import {SourceItem} from './types'
import {mergeSources} from './utils'

const SOURCES_LIMIT = 10

type Props = {
    helpCenterId: number
    shopName: string
    onPublicURLsChanged: (publicURLs: string[]) => void
    sourceItems?: SourceItem[]
    selectedHelpCenterId?: number
    shouldLogEventOnSync?: boolean
}

export const PublicSourcesSection = ({
    helpCenterId,
    shopName,
    onPublicURLsChanged,
    sourceItems,
    selectedHelpCenterId,
    shouldLogEventOnSync = false,
}: Props) => {
    const dispatch = useAppDispatch()

    usePublicResourcesPooling({helpCenterId, shopName})
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

    const logConnectedPublicUrl = (url: string) => {
        if (shouldLogEventOnSync) {
            logEvent(SegmentEvent.AiAgentOnboardingWizardPublicUrlIngested, {
                url,
            })
        }
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
            logConnectedPublicUrl(url)
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
                >
                    <ButtonIconLabel icon="add">Add URL</ButtonIconLabel>
                </Button>
            </div>
        </div>
    )
}
