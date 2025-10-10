import React, { useCallback } from 'react'

import { useFormContext } from 'react-hook-form'

import { LegacyButton as Button } from '@gorgias/axiom'

import { Magento2Integration } from 'models/integration/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'

import { useMagentoSettings } from './hooks/useMagentoSettings'

import css from './MagentoSettings.less'

interface ActionButtonsProps {
    onDelete: () => void
    integration: Magento2Integration
    redirectUri: string
    isSubmitting: boolean
}

export default function ActionButtons({
    onDelete,
    integration,
    redirectUri,
    isSubmitting,
}: ActionButtonsProps) {
    const { reset, formState, watch } = useFormContext()

    const { isActive, isManual } = useMagentoSettings(integration)
    const adminUrlSuffix = watch('adminURLSuffix')
    const submitIsDisabled = !formState.isDirty || !adminUrlSuffix

    const handleReset = useCallback(() => {
        const defaultValues = {
            adminURLSuffix: integration.meta.admin_url_suffix || '',
            consumerKey: '',
            consumerSecret: '',
            accessToken: '',
            accessTokenSecret: '',
        }
        reset(defaultValues)
    }, [reset, integration.meta.admin_url_suffix])

    const reconnect = useCallback(() => {
        const adminUrlSuffix = integration.meta.admin_url_suffix

        const url = integration.meta.store_url
        window.location.href = redirectUri.concat(
            `?store_url=${url}&admin_url_suffix=${adminUrlSuffix}`,
        )
    }, [integration, redirectUri])

    return (
        <div className={css.buttonGroup}>
            {isActive && (
                <>
                    <Button
                        isDisabled={submitIsDisabled}
                        type="submit"
                        fillStyle="fill"
                        intent="primary"
                        isLoading={isSubmitting}
                    >
                        Save Changes
                    </Button>

                    <Button
                        fillStyle="fill"
                        intent="secondary"
                        onClick={handleReset}
                        isDisabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </>
            )}

            {!isActive &&
                (isManual ? (
                    <Button
                        type="submit"
                        isDisabled={submitIsDisabled}
                        isLoading={isSubmitting}
                    >
                        Reconnect
                    </Button>
                ) : (
                    <ConfirmButton
                        isLoading={isSubmitting}
                        onConfirm={reconnect}
                        confirmationContent="You first need to delete the integration on your Magento2 store so that you can re-add it using this button"
                    >
                        Reconnect
                    </ConfirmButton>
                ))}
            <Button
                fillStyle="ghost"
                intent="destructive"
                onClick={onDelete}
                leadingIcon="delete_outline"
                isDisabled={isSubmitting}
            >
                Delete Store
            </Button>
        </div>
    )
}
