import React, {useEffect, useRef, useState} from 'react'
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap'
import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import shopify from 'assets/img/integrations/shopify.png'

import Button from 'pages/common/components/button/Button'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import DEPRECATED_Modal from 'pages/common/components/DEPRECATED_Modal'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import Tooltip from 'pages/common/components/Tooltip'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'

import settingsCss from 'pages/settings/settings.less'

import {useShopifyStoreWithChatConnectionsOptions} from '../../hooks/useShopifyStoreWithChatConnectionsOptions'

import css from './ConnectToShopSection.less'

interface Props {
    onUpdate: (data: {
        shop_name: string | null
        self_service_deactivated?: boolean
    }) => void
    shopName: string | null
}

export const ConnectToShopSection = ({
    shopName,
    onUpdate,
}: Props): JSX.Element | null => {
    const isAutomationSettingsRevampEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomationSettingsRevamp]
    const [disconnectModalOpen, setDisconnectModalOpen] = useState(false)
    const [connectModalOpen, setConnectModalOpen] = useState(false)
    const [selectedShop, setSelectedShop] = useState(shopName)

    useEffect(() => {
        setSelectedShop(shopName)
    }, [shopName])

    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const disconnectButtonRef = useRef<HTMLSpanElement>(null)

    const shopifyShopsOptions = useShopifyStoreWithChatConnectionsOptions({
        option: css['select-option'],
        icon: css['shopify-icon'],
        connectedChatsCount: css['select-connected-chats'],
    })

    return (
        <section className={settingsCss.mb40}>
            {isAutomationSettingsRevampEnabled ? (
                <h3>Connect to Shopify store</h3>
            ) : (
                <h4>Connect to Shopify store</h4>
            )}

            <p className={css.connectDescription}>
                {isAutomationSettingsRevampEnabled
                    ? 'A store connection is required to use Automation Add-on features in Help Center. Currently only available for Shopify stores.'
                    : 'Connect this Help Center to a Shopify store to enable Self-service flows.'}
            </p>

            {shopName ? (
                <div className={css['connected-store']}>
                    <img
                        src={shopify}
                        className={css['shopify-icon']}
                        alt="shopify logo"
                    />

                    <span className={css['store-name']}>{shopName}</span>

                    {isAutomationSettingsRevampEnabled ? (
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
                                confirmationContent="Disconnecting this store will remove automation features from your Help Center."
                                confirmationTitle={<b>Disconnect store?</b>}
                                confirmLabel="Disconnect"
                                fillStyle="ghost"
                                intent="destructive"
                                onConfirm={() => {
                                    setDisconnectModalOpen(false)
                                    onUpdate({shop_name: null})
                                }}
                                placement="top"
                                showCancelButton
                            >
                                Disconnect
                            </ConfirmButton>
                        </div>
                    ) : (
                        <span
                            className={classNames(
                                'ml-auto',
                                css['disconnect-button']
                            )}
                            ref={disconnectButtonRef}
                        >
                            <i className="material-icons">delete</i>
                        </span>
                    )}

                    <Tooltip
                        placement="top"
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
                                    onUpdate({shop_name: null})
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
                className={css['modal-centered']}
                header="Connect a Shopify store"
                onClose={() => setConnectModalOpen(false)}
                footer={
                    <div>
                        <Button
                            intent="secondary"
                            onClick={() => setConnectModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="ml-3"
                            isDisabled={selectedShop === null}
                            onClick={() => {
                                onUpdate({
                                    shop_name: selectedShop,
                                    self_service_deactivated:
                                        !hasAutomationAddOn,
                                })

                                setConnectModalOpen(false)
                            }}
                        >
                            Connect
                        </Button>
                    </div>
                }
            >
                <>
                    <div className={css.selectStoreLabel}>Select store</div>

                    <SelectField
                        value={selectedShop}
                        fullWidth
                        placeholder="Select store"
                        onChange={(value) => {
                            // this type cast is safe as all values are string
                            setSelectedShop(value as string)
                        }}
                        options={shopifyShopsOptions}
                    />
                </>
            </DEPRECATED_Modal>
        </section>
    )
}
