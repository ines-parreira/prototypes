import React, { useEffect, useRef, useState } from 'react'

import classNames from 'classnames'
import { Popover, PopoverBody, PopoverHeader } from 'reactstrap'

import { LegacyButton as Button, Tooltip } from '@gorgias/axiom'

import store from 'assets/img/icons/store.svg'
import { useTheme } from 'core/theme'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import DEPRECATED_Modal from 'pages/common/components/DEPRECATED_Modal'
import SelectStore, {
    HelpCenterContactFormIntegrationTypes,
} from 'pages/settings/common/SelectStore/SelectStore'
import settingsCss from 'pages/settings/settings.less'
import { getHasAutomate } from 'state/billing/selectors'
import { getIconFromType } from 'state/integrations/helpers'
import { getIntegrationsByTypes } from 'state/integrations/selectors'

import css from './ConnectToShopSection.less'

interface Props {
    onUpdate: (data: {
        shop_name: string | null
        shop_integration_id: number | null
        self_service_deactivated?: boolean
    }) => void
    shopName: string | null
    shopType: IntegrationType | null
    shopIntegrationId: number | null
}

export const ConnectToShopSection = ({
    shopName,
    shopIntegrationId,
    shopType,
    onUpdate,
}: Props): JSX.Element | null => {
    const [disconnectModalOpen, setDisconnectModalOpen] = useState(false)
    const [connectModalOpen, setConnectModalOpen] = useState(false)
    const [selectedShop, setSelectedShop] = useState({
        shopName,
        shopIntegrationId,
    })
    const [showWarning, setShowWarning] = useState(true)
    const theme = useTheme()

    useEffect(() => {
        setSelectedShop({ shopName, shopIntegrationId })
    }, [shopName, shopIntegrationId])

    const hasAutomate = useAppSelector(getHasAutomate)

    const disconnectButtonRef = useRef<HTMLSpanElement>(null)
    const gorgiasChatIntegrations = useAppSelector(
        getIntegrationsByTypes([IntegrationType.GorgiasChat]),
    )
    return (
        <section className={settingsCss.mb40}>
            <h3 className={css.title}>Connect store</h3>

            <p className={css.connectDescription}>
                A store connection is required to use AI Agent features and
                enable auto-embedding for Shopify stores.
            </p>

            {shopName ? (
                <div className={css['connected-store']}>
                    <img
                        src={shopType ? getIconFromType(shopType) : store}
                        className={css['store-icon']}
                        alt="store logo"
                    />

                    <span className={css['store-name']}>{shopName}</span>
                    <div className="ml-auto">
                        <Button
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={() => setConnectModalOpen(true)}
                        >
                            Change
                        </Button>
                        <ConfirmButton
                            confirmationButtonIntent="destructive"
                            confirmationContent="Disconnecting this help center from the store will uninstall it, and make Auto-embedding and AI Agent features unavailable."
                            confirmationTitle={<b>Disconnect store?</b>}
                            confirmLabel="Disconnect"
                            fillStyle="ghost"
                            intent="destructive"
                            onConfirm={() => {
                                setDisconnectModalOpen(false)
                                onUpdate({
                                    shop_name: null,
                                    shop_integration_id: null,
                                })
                            }}
                            placement="top"
                            showCancelButton
                        >
                            Disconnect
                        </ConfirmButton>
                    </div>

                    <Tooltip
                        placement="top"
                        className="popoverDark"
                        target={disconnectButtonRef}
                        disabled={disconnectModalOpen}
                    >
                        Disconnect Help Center from this store
                    </Tooltip>

                    <Popover
                        placement="top"
                        isOpen={disconnectModalOpen}
                        target={disconnectButtonRef}
                        toggle={() =>
                            setDisconnectModalOpen(!disconnectModalOpen)
                        }
                    >
                        <PopoverHeader>Are you sure?</PopoverHeader>
                        <PopoverBody>
                            <p>
                                Disconnecting this store from the Help Center
                                will remove Self-Service features (if the
                                features are enabled).
                            </p>

                            <p>
                                Are you sure you want to disconnect{' '}
                                <strong>{shopName}</strong> from this Help
                                Center?
                            </p>

                            <Button
                                intent="destructive"
                                onClick={() => {
                                    setDisconnectModalOpen(false)
                                    onUpdate({
                                        shop_name: null,
                                        shop_integration_id: null,
                                    })
                                }}
                            >
                                Disconnect
                            </Button>
                        </PopoverBody>
                    </Popover>
                </div>
            ) : (
                <Button
                    intent="secondary"
                    onClick={() => setConnectModalOpen(true)}
                >
                    Connect
                </Button>
            )}

            <DEPRECATED_Modal
                isOpen={connectModalOpen}
                className={classNames(
                    css['modal-centered'],
                    theme.resolvedName,
                )}
                header={shopName ? 'Change store' : 'Connect store'}
                onClose={() => setConnectModalOpen(false)}
                footer={
                    <div className={css.buttonsWrapper}>
                        <Button
                            intent="secondary"
                            onClick={() => setConnectModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            isDisabled={selectedShop === null}
                            onClick={() => {
                                onUpdate({
                                    shop_name: selectedShop.shopName,
                                    shop_integration_id:
                                        selectedShop.shopIntegrationId,
                                    self_service_deactivated: !hasAutomate,
                                })

                                setConnectModalOpen(false)
                            }}
                        >
                            {shopName ? 'Change Store' : 'Connect Store'}
                        </Button>
                    </div>
                }
            >
                <>
                    <div className={css.selectStoreLabel}>
                        A store connection is required to use AI Agent features
                        and enable auto-embedding for Shopify stores.
                    </div>
                    {shopName &&
                        selectedShop.shopName !== shopName &&
                        showWarning && (
                            <Alert
                                type={AlertType.Warning}
                                className={css.alert}
                                icon
                                onClose={() => setShowWarning(false)}
                            >
                                Make sure to re-embed the Help Center back to
                                all applicable pages.
                            </Alert>
                        )}

                    <SelectStore
                        gorgiasChatIntegrations={gorgiasChatIntegrations}
                        shopName={selectedShop.shopName}
                        shopIntegrationId={selectedShop.shopIntegrationId}
                        handleStoreChange={(
                            integration: HelpCenterContactFormIntegrationTypes,
                        ) => {
                            setSelectedShop({
                                shopName: integration.name,
                                shopIntegrationId: integration.id,
                            })
                        }}
                    />
                </>
            </DEPRECATED_Modal>
        </section>
    )
}
