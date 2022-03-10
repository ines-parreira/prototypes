import React, {useMemo, useRef, useState} from 'react'
import {Popover, PopoverBody, PopoverHeader} from 'reactstrap'
import {Map} from 'immutable'
import classNames from 'classnames'

import shopify from 'assets/img/integrations/shopify.png'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import {getHasAutomationAddOn} from 'state/billing/selectors'
import Modal from 'pages/common/components/Modal'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {IntegrationType} from 'models/integration/types'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {Option} from 'pages/common/forms/SelectField/types'
import {HelpCenter} from 'models/helpCenter/types'
import Tooltip from 'pages/common/components/Tooltip'
import useAppSelector from 'hooks/useAppSelector'

import css from './ConnectToShopSection.less'

interface Props {
    onUpdate: (data: {
        shop_name: string | null
        self_service_deactivated?: boolean
    }) => void
    helpCenter: HelpCenter
}

const NO_SELECTED_SHOP = '_NO_SELECTED_SHOP_'

const optionLabel = (shop: JSX.Element | string, connectedChats = 0) => (
    <span className={css['select-option']}>
        <span>
            <img
                src={shopify}
                className={css['shopify-icon']}
                alt="shopify logo"
            />
        </span>

        <span>{shop}</span>

        {connectedChats > 0 ? (
            <span className={css['select-connected-chats']}>
                {connectedChats} connected chat{connectedChats > 1 ? 's' : null}
            </span>
        ) : null}
    </span>
)

export const ConnectToShopSection = ({
    helpCenter,
    onUpdate,
}: Props): JSX.Element | null => {
    const [disconnectModalOpen, setDisconnectModalOpen] = useState(false)
    const [connectModalOpen, setConnectModalOpen] = useState(false)
    const [selectedShop, setSelectedShop] = useState<string>(
        helpCenter.shop_name ?? NO_SELECTED_SHOP
    )

    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)

    const disconnectButtonRef = useRef<HTMLSpanElement>(null)

    const shopifyIntegrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.Shopify)
    )

    const chatIntegrations = useAppSelector(
        getIntegrationsByTypes(IntegrationType.GorgiasChat)
    )

    const shopsOptions: Option[] = useMemo(() => {
        const options = shopifyIntegrations
            .valueSeq()
            .map<Option>((integration: Map<any, any>) => {
                const shopName: string = integration.getIn([
                    'meta',
                    'shop_name',
                ])

                const connectedChats = chatIntegrations
                    .toArray()
                    .filter((chat: Map<any, any>) => {
                        const chatShopName: string | undefined = chat.getIn(
                            ['meta', 'shop_name'],
                            undefined
                        )

                        return chatShopName === shopName
                    }).length

                return {
                    value: shopName,
                    label: optionLabel(shopName, connectedChats),
                    text: shopName,
                }
            })
            .toArray()

        if (selectedShop === NO_SELECTED_SHOP) {
            return [
                {
                    value: NO_SELECTED_SHOP,
                    label: optionLabel(
                        <span className={css['select-default']}>
                            Select store
                        </span>
                    ),
                },
                ...options,
            ]
        }

        return options
    }, [chatIntegrations, selectedShop, shopifyIntegrations])

    return (
        <section>
            <h4>Connect to Shopify store</h4>

            <p>
                Connect this Help Center to a Shopify store to enable
                Self-service flows.
            </p>

            {helpCenter.shop_name ? (
                <div className={css['connected-store']}>
                    <img
                        src={shopify}
                        className={css['shopify-icon']}
                        alt="shopify logo"
                    />

                    <span className={css['store-name']}>
                        {helpCenter.shop_name}
                    </span>

                    <span
                        className={classNames(
                            'ml-auto',
                            css['disconnect-button']
                        )}
                        ref={disconnectButtonRef}
                    >
                        <i className="material-icons">delete</i>
                    </span>

                    <Tooltip
                        placement="top"
                        target={disconnectButtonRef}
                        disabled={disconnectModalOpen}
                    >
                        Disconnect help center from this store
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
                                Disconnecting this store from the help center
                                will remove Self-Service features (if the
                                features are enabled).
                            </p>

                            <p>
                                Are you sure you want to disconnect{' '}
                                <strong>{helpCenter.shop_name}</strong> from
                                this help center?
                            </p>

                            <Button
                                intent={ButtonIntent.Destructive}
                                onClick={() => {
                                    setDisconnectModalOpen(false)
                                    setSelectedShop(NO_SELECTED_SHOP)
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
                    intent={ButtonIntent.Primary}
                    onClick={() => setConnectModalOpen(true)}
                >
                    Connect
                </Button>
            )}

            <Modal
                isOpen={connectModalOpen}
                className={css['modal-centered']}
                header="Connect a Shopify store"
                onClose={() => setConnectModalOpen(false)}
                footer={
                    <div>
                        <Button
                            intent={ButtonIntent.Secondary}
                            onClick={() => setConnectModalOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="ml-3"
                            isDisabled={selectedShop === NO_SELECTED_SHOP}
                            intent={ButtonIntent.Primary}
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
                    <p>
                        Activate the customer chat widget on your Shopify store
                        in one click.
                        {hasAutomationAddOn && (
                            <span>
                                {' '}
                                Note that this will automatically enable
                                Self-Service.
                            </span>
                        )}
                    </p>

                    <SelectField
                        value={selectedShop}
                        fullWidth
                        onChange={(value) => {
                            // this type cast is safe as all values are string
                            setSelectedShop(value as string)
                        }}
                        options={shopsOptions}
                    />
                </>
            </Modal>
        </section>
    )
}
