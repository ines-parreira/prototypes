import {Tooltip} from '@gorgias/ui-kit'

import classNames from 'classnames'
import React, {useEffect, useRef, useState} from 'react'
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap'

import store from 'assets/img/icons/store.svg'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import DEPRECATED_Modal from 'pages/common/components/DEPRECATED_Modal'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import settingsCss from 'pages/settings/settings.less'

import {getHasAutomate} from 'state/billing/selectors'
import {getIconFromType} from 'state/integrations/helpers'
import {useTheme} from 'theme'

import {useStoreWithChatConnectionsOptions} from '../../hooks/useStoreWithChatConnectionsOptions'

import css from './ConnectToShopSection.less'

interface Props {
    onUpdate: (data: {
        shop_name: string | null
        self_service_deactivated?: boolean
    }) => void
    shopName: string | null
    shopType?: IntegrationType
}

export const ConnectToShopSection = ({
    shopName,
    shopType,
    onUpdate,
}: Props): JSX.Element | null => {
    const [disconnectModalOpen, setDisconnectModalOpen] = useState(false)
    const [connectModalOpen, setConnectModalOpen] = useState(false)
    const [selectedShop, setSelectedShop] = useState(shopName)
    const [showWarning, setShowWarning] = useState(true)
    const theme = useTheme()

    useEffect(() => {
        setSelectedShop(shopName)
    }, [shopName])

    const hasAutomate = useAppSelector(getHasAutomate)

    const disconnectButtonRef = useRef<HTMLSpanElement>(null)

    const eCommerceShopsOptions = useStoreWithChatConnectionsOptions({
        option: css['select-option'],
        icon: css['store-icon'],
        connectedChatsCount: css['select-connected-chats'],
    })

    return (
        <section className={settingsCss.mb40}>
            <h3 className={css.title}>Connect store</h3>

            <p className={css.connectDescription}>
                A store connection is required to use Automate features and
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
                            confirmationContent="Disconnecting this help center from the store will uninstall it, and make 
Auto-embedding and Automate features unavailable."
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
                className={classNames(css['modal-centered'], theme)}
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
                                    shop_name: selectedShop,
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
                        A store connection is required to use Automate features
                        and enable auto-embedding for Shopify stores.
                    </div>
                    {shopName && selectedShop !== shopName && showWarning && (
                        <Alert
                            type={AlertType.Warning}
                            className={css.alert}
                            icon
                            onClose={() => setShowWarning(false)}
                        >
                            Make sure to re-embed the Help Center back to all
                            applicable pages.
                        </Alert>
                    )}
                    <SelectField
                        value={selectedShop}
                        fullWidth
                        placeholder="Select a store"
                        onChange={(value) => {
                            // this type cast is safe as all values are string
                            setSelectedShop(value as string)
                        }}
                        options={eCommerceShopsOptions}
                        icon={selectedShop ? '' : 'store'}
                    />
                </>
            </DEPRECATED_Modal>
        </section>
    )
}
