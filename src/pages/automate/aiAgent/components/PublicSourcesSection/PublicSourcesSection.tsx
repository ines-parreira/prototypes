import React, {useEffect, useState} from 'react'
import {Tooltip} from '@gorgias/ui-kit'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
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
}

export const PublicSourcesSection = ({
    helpCenterId,
    shopName,
    onPublicURLsChanged,
    sourceItems,
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

    return (
        <div className={css.container}>
            <div>
                <h3 className={css.title}>Public URL sources</h3>
                <div>
                    Add URLs to specific web pages that AI Agent should
                    reference to answer shopper questions, for example
                    "https://yourstore.com/faqs" and
                    "https://yourstore.com/return-policy". Image and video
                    content is ignored.
                </div>
            </div>

            {sources.length > 0 && (
                <ul className={css.list}>
                    {sources.map((source) => (
                        <li key={source.id} data-testid="source-item">
                            <PublicSourcesItem
                                existingUrls={existingUrls}
                                source={source}
                                onDelete={onDeleteSource}
                                onSync={onSyncSource}
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
                    data-testid="add-button"
                    intent="secondary"
                    onClick={onAddClick}
                    isDisabled={isLimitReached}
                    disabled={isLimitReached}
                >
                    <ButtonIconLabel icon="add">Add URL</ButtonIconLabel>
                </Button>
            </div>
        </div>
    )
}
