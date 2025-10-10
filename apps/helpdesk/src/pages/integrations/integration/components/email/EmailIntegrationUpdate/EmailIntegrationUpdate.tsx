import React, { useCallback, useEffect, useState } from 'react'

import classnames from 'classnames'
import { Map } from 'immutable'
import { Col, Container } from 'reactstrap'

import { Banner, LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    EmailIntegration,
    GmailIntegration,
    IntegrationType,
    OutlookIntegration,
} from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import EmailGenericModal from 'pages/integrations/integration/components/email/components/EmailGenericModal'
import EmailIntegrationAddressField from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/EmailIntegrationAddressField'
import EmailIntegrationButtons from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/EmailIntegrationButtons'
import EmailSettings from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/EmailSettings'
import { useEmailIntegrationUpdate } from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/hooks/useEmailIntegrationUpdate'
import EmailIntegrationConnectStore from 'pages/integrations/integration/components/email/EmailToStoreMapping/EmailIntegrationConnectStore'
import settingsCss from 'pages/settings/settings.less'
import {
    deleteIntegration,
    updateOrCreateIntegration,
} from 'state/integrations/actions'
import { getRedirectUri } from 'state/integrations/selectors'
import { RootState } from 'state/types'

import { isBaseEmailAddress } from '../helpers'

type EmailIntegrationMap = Map<string, any> & {
    get(
        key: 'type',
    ): IntegrationType.Email | IntegrationType.Gmail | IntegrationType.Outlook
    get(key: 'id'): number
    get(key: 'name'): string
    get(key: 'deactivated_datetime'): string | null | undefined
    get(key: string): any
    toJS(): EmailIntegration | GmailIntegration | OutlookIntegration
}

type Props = {
    integration: EmailIntegrationMap
    loading: Map<any, any>
}

const EmailIntegrationUpdate = ({ integration, loading }: Props) => {
    const {
        state,
        setName,
        setUseGmailCategories,
        setEnableGmailSending,
        setEnableOutlookSending,
        setEnableGmailThreading,
        setSignatureText,
        setSignatureHtml,
        initializeFromIntegration,
        showCancelModal,
        submitIntegration,
    } = useEmailIntegrationUpdate()

    const [showImportMigrationBanner, setShowImportMigrationBanner] =
        useState(true)

    const dispatch = useAppDispatch()
    const domain = useAppSelector((state: RootState) =>
        state.currentAccount.get('domain'),
    )
    const gmailRedirectUri = useAppSelector(
        getRedirectUri(IntegrationType.Gmail),
    )

    const isDeactivated = !!integration.get('deactivated_datetime')
    const isDeleting = loading.get('delete') === integration.get('id')
    const isSubmitting =
        loading.get('updateIntegration') === integration.get('id')
    const hasErrors = Object.values(state.errors).some((val) => val != null)
    const isGmail = integration.get('type') === IntegrationType.Gmail

    useEffect(() => {
        if (!state.isInitialized && !loading.get('integration')) {
            initializeFromIntegration(integration)
        }
    }, [loading, integration, state.isInitialized, initializeFromIntegration])

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()

            try {
                await submitIntegration(integration, (updatedIntegration) =>
                    dispatch(updateOrCreateIntegration(updatedIntegration)),
                )
            } catch (error) {
                console.error('Error updating integration:', error)
            }
        },
        [dispatch, integration, submitIntegration],
    )

    const handleDelete = useCallback(() => {
        dispatch(deleteIntegration(integration))
    }, [dispatch, integration])

    const handleReactivate = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            const url = `${gmailRedirectUri}?integration_id=${integration.get('id') as number}`
            window.open(url)
        },
        [gmailRedirectUri, integration],
    )

    const handleCancel = useCallback(() => {
        if (state.dirty) {
            showCancelModal(true)
        } else {
            history.push('/app/settings/channels/email')
        }
    }, [state.dirty, showCancelModal])

    const handleCancelModalClose = useCallback(() => {
        showCancelModal(false)
    }, [showCancelModal])

    const handleDiscardChanges = useCallback(() => {
        history.push('/app/settings/channels/email')
    }, [])

    if (loading.get('integration')) {
        return <Loader />
    }

    const integrationJSObj = integration.toJS()

    const isBaseIntegration = isBaseEmailAddress(
        integrationJSObj?.meta?.address,
    )

    return (
        <>
            <Container fluid className={settingsCss.pageContainer}>
                {showImportMigrationBanner && !isBaseIntegration && (
                    <Col
                        lg={6}
                        xl={7}
                        className={classnames('pl-0', settingsCss.mb24)}
                    >
                        <Banner
                            type="info"
                            fillStyle="fill"
                            isClosable={true}
                            onClose={() => setShowImportMigrationBanner(false)}
                            action={
                                <Button
                                    onClick={() => {
                                        history.push(
                                            `/app/settings/import-email?selectedEmail=${integrationJSObj?.meta?.address}`,
                                        )
                                    }}
                                    fillStyle="ghost"
                                >
                                    Import
                                </Button>
                            }
                        >
                            You can import up to 2 years of email history to
                            Gorgias. This helps you keep your past email content
                            and metadata in one place.
                        </Banner>
                    </Col>
                )}
                <h2 className={settingsCss.headingSection}>General</h2>
                <Col lg={6} xl={7} className="pl-0">
                    <div className="mt-4">
                        <EmailIntegrationAddressField
                            integration={integrationJSObj}
                        />
                        <EmailIntegrationConnectStore
                            integration={integration}
                        />
                    </div>

                    <EmailSettings
                        integration={integration}
                        domain={domain}
                        setSignatureText={setSignatureText}
                        setSignatureHtml={setSignatureHtml}
                        name={state.name}
                        setName={setName}
                        useGmailCategories={state.useGmailCategories}
                        setUseGmailCategories={setUseGmailCategories}
                        enableGmailThreading={state.enableGmailThreading}
                        setEnableGmailThreading={setEnableGmailThreading}
                        enableGmailSending={state.enableGmailSending}
                        setEnableGmailSending={setEnableGmailSending}
                        enableOutlookSending={state.enableOutlookSending}
                        setEnableOutlookSending={setEnableOutlookSending}
                    />

                    <EmailIntegrationButtons
                        isDirty={state.dirty}
                        isSubmitting={isSubmitting}
                        isDeleting={isDeleting}
                        hasErrors={hasErrors}
                        isDeactivated={isDeactivated}
                        isGmail={isGmail}
                        onSaveCallback={handleSubmit}
                        onCancelCallback={handleCancel}
                        onReactivateCallback={handleReactivate}
                        onDeleteCallback={handleDelete}
                    />
                </Col>
            </Container>

            <EmailGenericModal
                showModal={state.showCancelModal}
                title="Discard unsaved changes?"
                description="You have unsaved changes. Are you sure you want to leave without saving?"
                onCloseCleanup={handleCancelModalClose}
            >
                <Button intent="secondary" onClick={handleCancelModalClose}>
                    Back to Editing
                </Button>
                <Button intent="destructive" onClick={handleDiscardChanges}>
                    Discard Changes
                </Button>
            </EmailGenericModal>
        </>
    )
}

export default EmailIntegrationUpdate
