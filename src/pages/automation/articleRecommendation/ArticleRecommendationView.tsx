import React, {useEffect, useMemo, useState} from 'react'
import {Container} from 'reactstrap'
import {useParams} from 'react-router-dom'
import classnames from 'classnames'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import Label from 'pages/common/forms/Label/Label'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import useAppSelector from 'hooks/useAppSelector'
import {getActiveHelpCenterList} from 'state/entities/helpCenter/helpCenters'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {useHelpCenterPublishedArticlesCount} from 'pages/automation/common/hooks/useHelpCenterPublishedArticlesCount'
import useSelfServiceChatChannels from 'pages/automation/common/hooks/useSelfServiceChatChannels'

import ArticleRecommendationHelpCenter from './components/ArticleRecommendationHelpCenter'
import {
    ConnectedChannelsInfoAlert,
    EmptyHelpCenterAlert,
    ManyHelpCentersAlert,
    NoHelpCenterAlert,
} from './components/ArticleRecommendationAlerts'
import ArticleRecommendationPreview from './ArticleRecommendationPreview'

import css from './ArticleRecommendationView.less'

const ArticleRecommendationView = () => {
    const {shopType, shopName} = useParams<{
        shopType: string
        shopName: string
    }>()

    const {isLoading: isLoadingHelpCenters} = useHelpCenterList({
        per_page: HELP_CENTER_MAX_CREATION,
    })

    const {
        isUpdatePending,
        selfServiceConfiguration,
        handleSelfServiceConfigurationUpdate,
    } = useSelfServiceConfiguration(shopType, shopName)
    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const isLoading = !selfServiceConfiguration || isLoadingHelpCenters

    const [helpCenterId, setHelpCenterId] = useState<Maybe<number>>(undefined)

    const helpCenterArticlesCount =
        useHelpCenterPublishedArticlesCount(helpCenterId)

    useEffect(
        () =>
            setHelpCenterId(
                selfServiceConfiguration?.article_recommendation_help_center_id
            ),
        [selfServiceConfiguration]
    )

    const availableHelpCenters = useAppSelector(getActiveHelpCenterList)

    const helpCenter = useMemo(
        () => availableHelpCenters.find(({id}) => id === helpCenterId),
        [availableHelpCenters, helpCenterId]
    )

    const isDirty =
        helpCenterId !==
        selfServiceConfiguration?.article_recommendation_help_center_id

    const helpCenterEmpty = helpCenterArticlesCount === 0

    const handleSubmit = () => {
        if (selfServiceConfiguration) {
            void handleSelfServiceConfigurationUpdate({
                ...selfServiceConfiguration,
                article_recommendation_help_center_id: helpCenterId,
            })
        }
    }
    const handleCancel = () => {
        setHelpCenterId(
            selfServiceConfiguration?.article_recommendation_help_center_id
        )
    }

    return (
        <div className="full-width">
            <PageHeader title="Article recommendation" />
            <Container
                fluid
                className={classnames({
                    [css.container]: !isLoading,
                })}
            >
                {isLoading ? (
                    <Loader />
                ) : (
                    <>
                        <div className={css.content}>
                            <div className={css.descriptionContainer}>
                                <div className={css.description}>
                                    Automatically send a Help Center article in
                                    response customer questions in chat, if a
                                    relevant article exists. If a customer
                                    requests more help, a ticket will be created
                                    for an agent to handle.
                                </div>
                                <a
                                    href="https://docs.gorgias.com/en-US/help-center---article-recommendations-in-chat-89341"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <i className="material-icons mr-2">
                                        menu_book
                                    </i>
                                    Learn About Article Recommendation In Chat
                                </a>
                            </div>

                            {availableHelpCenters.length === 0 && (
                                <NoHelpCenterAlert />
                            )}

                            {availableHelpCenters.length > 1 &&
                                !helpCenterEmpty && (
                                    <ManyHelpCentersAlert
                                        shopName={shopName}
                                        shopType={shopType}
                                    />
                                )}

                            {helpCenterId && helpCenterEmpty && (
                                <EmptyHelpCenterAlert
                                    helpCenterId={helpCenterId}
                                />
                            )}

                            <Label className={css.selectorTitle}>
                                Help Center
                            </Label>

                            <ArticleRecommendationHelpCenter
                                helpCenter={helpCenter}
                                setHelpCenterId={setHelpCenterId}
                                availableHelpCenters={availableHelpCenters}
                            />

                            {helpCenter && (
                                <ConnectedChannelsInfoAlert
                                    shopName={shopName}
                                    shopType={shopType}
                                />
                            )}

                            <div
                                className={css.submitAndCancelButtonsContainer}
                            >
                                <Button
                                    isDisabled={!isDirty || isUpdatePending}
                                    onClick={handleSubmit}
                                >
                                    Save changes
                                </Button>
                                <Button
                                    isDisabled={!isDirty || isUpdatePending}
                                    onClick={handleCancel}
                                    intent="secondary"
                                >
                                    Cancel
                                </Button>
                            </div>
                            <UnsavedChangesPrompt
                                onSave={handleSubmit}
                                when={isDirty && !isUpdatePending}
                            />
                        </div>

                        <ArticleRecommendationPreview
                            channels={chatChannels}
                            selfServiceConfiguration={selfServiceConfiguration!}
                            isHelpCenterSelected={Boolean(helpCenter)}
                        />
                    </>
                )}
            </Container>
        </div>
    )
}

export default ArticleRecommendationView
