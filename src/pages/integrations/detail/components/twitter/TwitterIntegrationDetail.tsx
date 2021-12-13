import React, {useCallback, useEffect, useState} from 'react'
import {fromJS, Map} from 'immutable'
import {Link} from 'react-router-dom'
import classNames from 'classnames'
import _truncate from 'lodash/truncate'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    FormGroup,
    Row,
} from 'reactstrap'

import {
    deleteIntegration,
    updateOrCreateIntegration,
} from '../../../../../state/integrations/actions'
import PageHeader from '../../../../common/components/PageHeader'
import BooleanField from '../../../../common/forms/BooleanField.js'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import {IntegrationType} from '../../../../../models/integration/types'
import css from '../../../../settings/settings.less'

type Props = {
    integration: Map<string, any>
    actions: {
        updateOrCreateIntegration: typeof updateOrCreateIntegration
        deleteIntegration: typeof deleteIntegration
    }
    redirectUri: string
}

export default function TwitterIntegrationDetail({
    integration,
    actions,
    redirectUri,
}: Props): JSX.Element {
    const [isInitialized, setIsInitialized] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [integrationName, setIntegrationName] = useState('')
    const [integrationDescription, setIntegrationDescription] = useState('')
    const [integrationPicture, setIntegrationPicture] = useState('')
    const [integrationAbout, setIntegrationAbout] = useState('')
    const [tweetsRepliesEnabled, setTweetsRepliesEnabled] = useState(true)
    const [mentionsEnabled, setMentionsEnabled] = useState(true)
    const [directMessagesEnabled, setDirectMessagesEnabled] = useState(true)

    const onSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault()

            try {
                setIsSubmitting(true)
                await (actions.updateOrCreateIntegration(
                    fromJS({
                        id: integration.get('id'),
                        meta: {
                            settings: {
                                tweets_replies_enabled: tweetsRepliesEnabled,
                                mentions_enabled: mentionsEnabled,
                                direct_messages_enabled: directMessagesEnabled,
                            },
                        },
                    })
                ) as unknown as Promise<any>)
            } catch (error) {
                console.error(error)
            } finally {
                setIsSubmitting(false)
            }
        },
        [
            integration,
            actions,
            setIsSubmitting,
            tweetsRepliesEnabled,
            mentionsEnabled,
            directMessagesEnabled,
        ]
    )

    const onDelete = useCallback(async () => {
        try {
            setIsSubmitting(true)
            await (actions.deleteIntegration(
                integration
            ) as unknown as Promise<any>)
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }, [integration, actions])

    useEffect(() => {
        if (integration.isEmpty() || isInitialized) {
            return
        }

        const integrationName = integration.get('name', '')
        const integrationDescription = integration.get('description', '')
        const integrationPicture = integration.getIn(['meta', 'picture'], '')
        const integrationAbout = integration.getIn(['meta', 'about'], '')
        const tweetsRepliesEnabled = integration.getIn(
            ['meta', 'settings', 'tweets_replies_enabled'],
            false
        )
        const mentionsEnabled = integration.getIn(
            ['meta', 'settings', 'mentions_enabled'],
            false
        )
        const directMessagesEnabled = integration.getIn(
            ['meta', 'settings', 'direct_messages_enabled'],
            false
        )

        setIntegrationName(integrationName)
        setIntegrationDescription(integrationDescription)
        setIntegrationPicture(integrationPicture)
        setIntegrationAbout(integrationAbout)
        setTweetsRepliesEnabled(tweetsRepliesEnabled)
        setMentionsEnabled(mentionsEnabled)
        setDirectMessagesEnabled(directMessagesEnabled)

        setIsInitialized(true)
    }, [
        integration,
        isInitialized,
        setIsInitialized,
        setIntegrationName,
        setIntegrationDescription,
        setIntegrationPicture,
        setIntegrationAbout,
        setTweetsRepliesEnabled,
        setMentionsEnabled,
        setDirectMessagesEnabled,
    ])

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                Integrations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/integrations/${IntegrationType.Twitter}`}
                            >
                                Twitter
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {integrationName}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className={css.pageContainer}>
                <Row>
                    <Col md="7">
                        <Row>
                            <Col md="1">
                                <div className="d-flex align-items-center mb-3">
                                    <img
                                        alt="twitter logo"
                                        className="image rounded mr-3"
                                        width="48"
                                        src={integrationPicture}
                                    />
                                </div>
                            </Col>
                            <Col md="11">
                                <div className="text-faded">
                                    <h2 className="d-inline mr-3 text-info">
                                        {integrationName}
                                    </h2>
                                    <span className="mr-3">
                                        {integrationDescription}
                                    </span>
                                    <p className="mt-2">
                                        {_truncate(integrationAbout, {
                                            length: 250,
                                        })}
                                    </p>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <FormGroup>
                                    <BooleanField
                                        name="tweets_replies_enabled"
                                        type="checkbox"
                                        label="Enable replies to Tweets"
                                        value={tweetsRepliesEnabled}
                                        onChange={setTweetsRepliesEnabled}
                                    />
                                    <BooleanField
                                        name="mentions_enabled"
                                        type="checkbox"
                                        label="Enable Twitter mentions"
                                        value={mentionsEnabled}
                                        onChange={setMentionsEnabled}
                                    />
                                    <BooleanField
                                        name="direct_messages_enabled"
                                        type="checkbox"
                                        label="Enable Twitter direct messages"
                                        value={directMessagesEnabled}
                                        onChange={setDirectMessagesEnabled}
                                    />
                                </FormGroup>
                                <div>
                                    <Button
                                        type="submit"
                                        color="success"
                                        className={classNames('mr-2', {
                                            'btn-loading': isSubmitting,
                                        })}
                                        disabled={isSubmitting}
                                        onClick={onSubmit}
                                    >
                                        Save Changes
                                    </Button>

                                    <Button
                                        type="button"
                                        color="secondary"
                                        className={classNames({
                                            'btn-loading': isSubmitting,
                                        })}
                                        onClick={() =>
                                            (window.location.href = redirectUri)
                                        }
                                        disabled={isSubmitting}
                                    >
                                        Reconnect
                                    </Button>

                                    <ConfirmButton
                                        className="float-right"
                                        color="secondary"
                                        confirm={onDelete}
                                        content="Are you sure you want to delete this integration? All associated views and rules will be disabled."
                                        disabled={isSubmitting}
                                    >
                                        <i className="material-icons mr-1 text-danger">
                                            delete
                                        </i>
                                        Remove Twitter Account
                                    </ConfirmButton>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
