import React, { useEffect, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useLocation } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import useLocalStorage from 'hooks/useLocalStorage'
import { IntegrationType } from 'models/integration/constants'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import history from 'pages/history'
import { getCurrentUser } from 'state/currentUser/selectors'
import { makeGetRedirectUri } from 'state/integrations/selectors'
import { isAdmin } from 'utils'

import ModalActionsFooter from '../modal/ModalActionsFooter'
import useStoresRequiringScriptTagMigration from '../ScriptTagMigrationBanner/hooks/useStoresRequiringScriptTagMigration'

/**
 * Shows a modal to update Shopify store permissions, if the user has store(s) that require it.
 * The modal is shown periodically, on page load or navigation, the last time it was shown being stored in local storage.
 * The period is defined through the "chat-scope-update-modal" feature flag.
 */
const ScriptTagMigrationModal = () => {
    const { pathname } = useLocation()

    const migrationDueDate: string | undefined =
        useFlags()[FeatureFlagKey.ChatScopeUpdateDueDate]

    const showMigrationModalInMilliseconds = Number(
        useFlags()[FeatureFlagKey.ChatScopeUpdateModal],
    )

    const storesRequiringScriptTagMigration =
        useStoresRequiringScriptTagMigration()

    const getRedirectUri = useAppSelector(makeGetRedirectUri)

    const currentUser = useAppSelector(getCurrentUser)
    const currentUserId = currentUser.get('id') as number

    const storageKey = `user:${currentUserId}:script_tag_migration_modal_last_shown_time`

    const [lastDateShownTime, setLastDateShownTime] = useLocalStorage<
        number | null
    >(storageKey, null)

    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        const lastDateShown = lastDateShownTime
            ? new Date(lastDateShownTime)
            : null

        const triggerModal =
            showMigrationModalInMilliseconds &&
            (lastDateShown
                ? new Date().getTime() - lastDateShown.getTime() >
                  showMigrationModalInMilliseconds
                : true)

        if (triggerModal) {
            const now = new Date()

            setShowModal(true)
            setLastDateShownTime(now.getTime())
        }
    }, [
        showMigrationModalInMilliseconds,
        lastDateShownTime,
        setLastDateShownTime,
        pathname,
        storageKey,
    ])

    if (
        !migrationDueDate ||
        !isAdmin(currentUser) ||
        !storesRequiringScriptTagMigration ||
        !storesRequiringScriptTagMigration.length
    )
        return null

    const storesRequiringPermissionUpdates =
        storesRequiringScriptTagMigration.filter(
            ({ storeRequiresPermissionUpdates }) =>
                storeRequiresPermissionUpdates,
        )

    const firstShopName = storesRequiringPermissionUpdates.length
        ? storesRequiringPermissionUpdates[0].storeIntegration?.meta?.shop_name
        : ''

    if (
        !storesRequiringPermissionUpdates.length ||
        (storesRequiringPermissionUpdates.length === 1 && !firstShopName)
    ) {
        return null
    }

    const onConfirm = () => {
        if (storesRequiringPermissionUpdates.length > 1) {
            setShowModal(false)
            history.push('/app/settings/channels/gorgias_chat')
            return
        }

        const redirectUri = getRedirectUri(IntegrationType.Shopify)

        window.location.href = redirectUri.replace('{shop_name}', firstShopName)
    }

    const onClose = () => {
        setShowModal(false)
    }

    return (
        <Modal isOpen={showModal} onClose={onClose} isClosable>
            <ModalHeader title="Update Shopify store permissions" />
            <ModalBody>
                To keep 1-click installation for chat, you must update your
                Shopify permissions by <b>{migrationDueDate}</b>
            </ModalBody>
            <ModalActionsFooter>
                <Button onClick={onConfirm}>Update permissions</Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default ScriptTagMigrationModal
