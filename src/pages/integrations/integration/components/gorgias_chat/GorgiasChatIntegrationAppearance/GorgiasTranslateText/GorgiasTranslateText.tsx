import {Map} from 'immutable'
import {set} from 'lodash'
import React, {useCallback, useEffect, useState} from 'react'
import {connect} from 'react-redux'
import {Link, useHistory} from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Col,
    Container,
    Form,
    Row,
    Spinner,
} from 'reactstrap'

import {GORGIAS_CHAT_INTEGRATION_TYPE} from 'constants/integration'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import * as IntegrationsActions from 'state/integrations/actions'
import {RootState} from 'state/types'

import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import PageHeader from 'pages/common/components/PageHeader'
import {notify} from 'state/notifications/actions'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS,
} from '../../../../../../../config/integrations/gorgias_chat'
import useAppDispatch from '../../../../../../../hooks/useAppDispatch'
import {IntegrationType} from '../../../../../../../models/integration/types'
import * as integrationSelectors from '../../../../../../../state/integrations/selectors'
import {NotificationStatus} from '../../../../../../../state/notifications/types'
import {FlagLanguageItem} from '../../../../../../common/components/LanguageBulletList'
import GorgiasChatIntegrationNavigation from '../../GorgiasChatIntegrationNavigation'

import {
    Texts,
    Translations,
} from '../../../../../../../rest_api/gorgias_chat_protected_api/types'
import GorgiasTranslateExitModal from './GorgiasTranslateExitModal'
import GrogiasTranslateInputGroup from './GorgiasTranslateInputGroup'
import css from './GorgiasTranslateText.less'
import GorgiasTranslateTextBackLink from './GorgiasTranslateTextBackLink'
import formProps from './translations-available-keys'

const generalKeys = Object.keys(formProps.general)
const contactFormKeys = Object.keys(formProps.contactForm)
const dynamicWaitTimeKeys = Object.keys(formProps.dynamicWaitTime)
const emailCaptureKeys = Object.keys(formProps.emailCapture)
const autoResponderKeys = Object.keys(formProps.autoResponder)

type OwnProps = {
    integration: Map<any, any>
}

const mapStateToProps = (state: RootState) => {
    return {
        domain: state.currentAccount.get('domain'),
        hasAutomationAddOn: getHasAutomationAddOn(state),
        getIntegrationsByTypes:
            integrationSelectors.makeGetIntegrationsByTypes(state),
        gorgiasChatExtraState:
            integrationSelectors.getIntegrationTypeExtraState(
                GORGIAS_CHAT_INTEGRATION_TYPE as IntegrationType
            )(state),
    }
}
const mapDispatchToProps = {}

function GorgiasTranslateText({
    integration,
}: OwnProps & ReturnType<typeof mapStateToProps>) {
    const language =
        getSelectedLanguage(integration.getIn(['meta', 'language'])) ||
        getSelectedLanguage(GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT)

    const backUrl = `/app/settings/channels/gorgias_chat/${
        integration.get('id') as number
    }/appearance`

    const emailCaptureEnforcement = integration.getIn([
        'meta',
        'preferences',
        'email_capture_enforcement',
    ])
    const filterForlEmailCaptureKeys = {emailCaptureEnforcement}

    const dispatch = useAppDispatch()
    const history = useHistory()

    const dispatchNotification = useCallback(
        (
            message: string,
            status: NotificationStatus = NotificationStatus.Success
        ) => {
            void dispatch(
                notify({
                    status,
                    message: message,
                })
            )
        },
        [dispatch]
    )

    const [hasChanges, setHasChanges] = useState(false)
    const [isExitModalOpen, setIsExitModalOpen] = useState(false)
    const onClickCallback = useCallback(
        (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
            event.preventDefault()
            if (hasChanges) {
                setIsExitModalOpen(true)
            } else {
                history.push(backUrl)
            }
        },
        [hasChanges, history, backUrl]
    )

    const [showWarning, setShowWarning] = useState(true)
    const closeWarning = () => {
        setShowWarning(false)
    }

    const [translations, setTranslations] = useState({
        texts: {},
        sspTexts: {},
    })

    const [initialTexts, setInitialTexts] = useState({})
    const [texts, setTexts] = useState(initialTexts)
    const [loadingTexts, setLoadingTexts] = useState(false)

    const saveKeyValue = useCallback(
        (key: string, value: string) => {
            setHasChanges(true)
            set(texts, key, value || undefined)
            setTexts((texts) => ({...texts}))
        },
        [texts, setTexts, setHasChanges]
    )

    const updateApplicationTexts = useCallback(async (): Promise<void> => {
        const applicationId: string = integration.getIn(['meta', 'app_id'])
        await IntegrationsActions.updateApplicationTexts(
            applicationId,
            texts as Texts
        )
    }, [integration, texts])

    const onDiscarChangesAndExit = () => {
        setTexts(initialTexts)
        setHasChanges(false)
        history.push(backUrl)
    }

    const onSaveValuesAndExit = async () => {
        try {
            await updateApplicationTexts()
            setHasChanges(false)
            history.push(backUrl)
        } catch {
            dispatchNotification(
                `There was a problem. We couldn't update your changes`,
                NotificationStatus.Error
            )
        }
    }

    const onCloseModal = () => {
        setIsExitModalOpen(false)
    }

    const resetValues = useCallback(() => {
        setTexts(initialTexts)
        setHasChanges(false)
        dispatchNotification('Discarded changes')
    }, [setTexts, setHasChanges, initialTexts, dispatchNotification])

    const submitData = useCallback(
        async (evt: React.FormEvent<HTMLElement>) => {
            evt.preventDefault()

            try {
                await updateApplicationTexts()
                setInitialTexts({
                    texts: {...(texts as Texts).texts},
                    sspTexts: {...(texts as Texts).sspTexts},
                })
                setHasChanges(false)
                dispatchNotification('Your changes are now live')
            } catch {
                dispatchNotification(
                    `There was a problem. We couldn't update your changes`,
                    NotificationStatus.Error
                )
            }
        },
        [
            updateApplicationTexts,
            dispatchNotification,
            texts,
            setHasChanges,
            setInitialTexts,
        ]
    )

    const hasTranslationTexts = !!Object.keys(translations.texts).length
    const hasTextsValues = !!(texts as Texts).texts

    useEffect(() => {
        if (!hasTranslationTexts) {
            void IntegrationsActions.getTranslations(
                language.get('value')
            ).then((data: Translations) => {
                setTranslations(data)
            })
        }

        const applicationId: string = integration.getIn(['meta', 'app_id'])
        if (!loadingTexts && applicationId && !hasTextsValues) {
            setLoadingTexts(true)
            void IntegrationsActions.getApplicationTexts(applicationId).then(
                (data) => {
                    setInitialTexts({
                        texts: {...data.texts},
                        sspTexts: {...data.sspTexts},
                    })
                    setTexts(data)
                    setLoadingTexts(false)
                }
            )
        }
    }, [
        hasTranslationTexts,
        hasTextsValues,
        integration,
        setInitialTexts,
        setTexts,
        language,
        loadingTexts,
    ])

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                onClick={onClickCallback}
                                to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                            >
                                Chat
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <GorgiasChatIntegrationNavigation integration={integration} />

            <Container fluid className={css.pageContainer}>
                <Row>
                    <Col className={css.pageColumn} md="8">
                        <Row>
                            <Col className={css.pageColumn} md="6">
                                <GorgiasTranslateTextBackLink
                                    url={backUrl}
                                    onClick={onClickCallback}
                                />
                            </Col>
                            <Col className={css.pageColumn} md="6">
                                <div className={css.flagContainerWrapper}>
                                    <span className={css.flagContainer}>
                                        <FlagLanguageItem
                                            key={language.get('value')}
                                            code={language.get('value')}
                                            name={language.get('label')}
                                        />
                                    </span>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col className={css.pageColumn} md="8">
                        {showWarning && (
                            <Alert
                                className="mb-4"
                                type={AlertType.Warning}
                                icon
                                onClose={closeWarning}
                            >
                                <div>
                                    Any changes made through{' '}
                                    <b>
                                        <a
                                            href="https://docs.gorgias.com/en-US/advanced-customization-new-chat-81792"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            advanced customization
                                        </a>{' '}
                                        will override
                                    </b>{' '}
                                    changes made on this page.
                                </div>
                            </Alert>
                        )}
                    </Col>
                </Row>

                <Row>
                    <Col className={css.pageColumn} md="8">
                        <p>
                            This chat's language is set to{' '}
                            <b>{language.get('label')}</b>.
                        </p>
                    </Col>
                </Row>
            </Container>

            {(hasTranslationTexts && hasTextsValues && (
                <Form
                    onSubmit={submitData}
                    id="texts-form"
                    onReset={resetValues}
                >
                    <GrogiasTranslateInputGroup
                        title="General"
                        keys={generalKeys}
                        filtersForKeys={{}}
                        texts={texts}
                        translations={translations}
                        saveValue={saveKeyValue}
                        formPropsValues={formProps.general}
                    />

                    <GrogiasTranslateInputGroup
                        title="Contact form"
                        keys={contactFormKeys}
                        filtersForKeys={{}}
                        texts={texts}
                        translations={translations}
                        saveValue={saveKeyValue}
                        formPropsValues={formProps.contactForm}
                    />

                    <GrogiasTranslateInputGroup
                        title="Dynamic wait time"
                        keys={dynamicWaitTimeKeys}
                        filtersForKeys={{}}
                        texts={texts}
                        translations={translations}
                        saveValue={saveKeyValue}
                        formPropsValues={formProps.dynamicWaitTime}
                    />

                    <GrogiasTranslateInputGroup
                        title="Auto-responder"
                        keys={autoResponderKeys}
                        filtersForKeys={{}}
                        texts={texts}
                        translations={translations}
                        saveValue={saveKeyValue}
                        formPropsValues={formProps.autoResponder}
                    />

                    <GrogiasTranslateInputGroup
                        title="Email capture"
                        keys={emailCaptureKeys}
                        filtersForKeys={filterForlEmailCaptureKeys}
                        texts={texts}
                        translations={translations}
                        saveValue={saveKeyValue}
                        formPropsValues={formProps.emailCapture}
                    />

                    <div className={css.footerSpacer} />

                    <Container fluid className={css.buttonsContainer}>
                        <Button type="submit" color="primary" className="mr-3">
                            Save Changes
                        </Button>
                        <Button type="reset" color="secondary">
                            Discard Changes
                        </Button>
                    </Container>
                </Form>
            )) || (
                <div className={css.spinnerWrapper}>
                    <Spinner className={css.spinner} color="gloom" />
                </div>
            )}

            <GorgiasTranslateExitModal
                isOpen={isExitModalOpen}
                onClose={onCloseModal}
                onConfirm={onSaveValuesAndExit}
                onDiscard={onDiscarChangesAndExit}
            />
        </div>
    )
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GorgiasTranslateText)

function getSelectedLanguage(languageKey: string) {
    const language = GORGIAS_CHAT_WIDGET_LANGUAGE_OPTIONS.find((el) => {
        return el?.get('value') === languageKey
    })

    return language
}
