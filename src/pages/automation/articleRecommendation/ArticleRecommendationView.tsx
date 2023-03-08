import React, {useEffect, useMemo, useState} from 'react'
import {Container} from 'reactstrap'
import {Link, useParams} from 'react-router-dom'
import classnames from 'classnames'

import PageHeader from 'pages/common/components/PageHeader'
import Loader from 'pages/common/components/Loader/Loader'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Label from 'pages/common/forms/Label/Label'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import useAppSelector from 'hooks/useAppSelector'
import {getActiveHelpCenterList} from 'state/entities/helpCenter/helpCenters'

import useSelfServiceConfiguration from '../common/hooks/useSelfServiceConfiguration'

import css from './ArticleRecommendationView.less'
import ArticleRecommendationHelpCenter from './components/ArticleRecommendationHelpCenter'
import ArticleRecommendationPreview from './components/ArticleRecommendationPreview'

const NoHelpCenterAlert = () => (
    <Alert
        className={css.warning}
        icon
        type={AlertType.Warning}
        customActions={
            <Link to={`/app/settings/help-center`}>Create Help Center</Link>
        }
    >
        Create a help center and add articles to use this feature.
    </Alert>
)

const ManyHelpCentersAlert = () => (
    <Alert className={css.warning} icon type={AlertType.Warning}>
        You have more than one Help Center. Make sure the desired Help Center is
        selected below.
    </Alert>
)

const ConnectedChannelsInfoAlert = ({
    shopName,
    shopType,
}: {
    shopName: string
    shopType: string
}) => (
    <Alert className={css.alert} icon>
        Control where customers receive article recommendations in{' '}
        <Link to={`/app/automation/${shopType}/${shopName}/connected-channels`}>
            connected channels
        </Link>
        .
    </Alert>
)

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

    const isLoading = !selfServiceConfiguration || isLoadingHelpCenters

    const [helpCenterId, setHelpCenterId] = useState<Maybe<number>>(undefined)

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
                        <div>
                            <div className={css.descriptionContainer}>
                                <p className="mb-1">
                                    Automatically send a Help Center article in
                                    response customer questions in chat, if a
                                    relevant article exists. If a customer
                                    requests more help, a ticket will be created
                                    for an agent to handle.
                                </p>
                                <a
                                    href="https://docs.gorgias.com/en-US/help-center---article-recommendations-in-chat-89341"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <i className="material-icons mr-2">
                                        menu_book
                                    </i>
                                    Learn About Article Recommendation in Chat
                                </a>
                            </div>

                            {availableHelpCenters.length === 0 && (
                                <NoHelpCenterAlert />
                            )}

                            {availableHelpCenters.length > 1 && (
                                <ManyHelpCentersAlert />
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
                            shopName={shopName}
                            shopType={shopType}
                            helpCenter={helpCenter}
                        />
                    </>
                )}
            </Container>
        </div>
    )
}

export default ArticleRecommendationView
