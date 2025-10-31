import classnames from 'classnames'
import { Button } from 'reactstrap'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import warningIcon from 'assets/img/icons/warning.svg'
import shopifyLogo from 'assets/img/integrations/shopify.png'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'

import css from './OneClickInstallationCardStoreRow.less'

interface Props {
    isChatInstalled: boolean
    targetIntegrationId: number
    targetIntegrationName: string
    isLegacyInstallation: boolean
    hasLegacyInstallations?: boolean
    isIntegrationDeactivated: boolean
    onInstall: (targetIntegrationId: number) => void
    onUninstall: (targetIntegrationId: number) => void
    onDisconnect: (targetIntegrationId: number) => void
    loading: {
        [key: string]: {
            installation?: boolean
            disconnection?: boolean
        } | null
    }
}

export const OneClickInstallationCardStoreRow = ({
    isChatInstalled,
    targetIntegrationId,
    targetIntegrationName,
    isLegacyInstallation,
    hasLegacyInstallations,
    isIntegrationDeactivated,
    onInstall,
    onUninstall,
    onDisconnect,
    loading,
}: Props) => {
    const getWarnings = (
        targetIntegrationId: number,
        {
            isLegacyInstallation,
            isIntegrationDeactivated,
        }: { isLegacyInstallation: boolean; isIntegrationDeactivated: boolean },
    ) => {
        if (isIntegrationDeactivated) {
            return (
                <>
                    <img
                        src={warningIcon}
                        alt="warning icon"
                        id={`deactivated-integration-${targetIntegrationId}`}
                        className={`${css['warning-icon']}`}
                    />
                    <Tooltip
                        target={`deactivated-integration-${targetIntegrationId}`}
                        placement="top"
                    >
                        Shopify store has been disconnected from Gorgias. Chat
                        integration will remain installed on the website but
                        self-service features will be deactivated.
                    </Tooltip>
                    <span className={`${css['disconnected-store']}`}>
                        Disconnected store
                    </span>
                </>
            )
        } else if (isLegacyInstallation) {
            return (
                <>
                    <img
                        src={warningIcon}
                        alt="warning icon"
                        id={`legacy-installation-${targetIntegrationId}`}
                        className={`${css['warning-icon']}`}
                    />
                    <Tooltip
                        target={`legacy-installation-${targetIntegrationId}`}
                        placement="top"
                    >
                        The new chat integration can only be installed on one
                        store at a time. Please create new chat integrations for
                        these additional stores.
                    </Tooltip>
                </>
            )
        }

        return null
    }

    const isInstallationLoading = Boolean(
        loading[targetIntegrationId] &&
            loading[targetIntegrationId]?.installation,
    )

    const isDisconnectionLoading = Boolean(
        loading[targetIntegrationId] &&
            loading[targetIntegrationId]?.disconnection,
    )

    return (
        <div className={css['one-click-installation']}>
            <div className={css['one-click-installation-inner']}>
                <img
                    alt={`shopify-logo`}
                    className={css['shopify-logo']}
                    src={shopifyLogo}
                />
                <b>{targetIntegrationName}</b>
                {getWarnings(targetIntegrationId, {
                    isLegacyInstallation,
                    isIntegrationDeactivated,
                })}
            </div>
            <div className={css['actions-wrapper']}>
                {isChatInstalled ? (
                    <Button
                        onClick={() => {
                            onUninstall(targetIntegrationId)
                        }}
                        className={classnames({
                            'btn-loading': isInstallationLoading,
                        })}
                        disabled={
                            isDisconnectionLoading || isInstallationLoading
                        }
                    >
                        {isInstallationLoading ? 'Uninstalling' : 'Uninstall'}
                    </Button>
                ) : (
                    <Button
                        onClick={() => onInstall(targetIntegrationId)}
                        className={classnames({
                            'btn-loading': isInstallationLoading,
                        })}
                        disabled={
                            isDisconnectionLoading || isInstallationLoading
                        }
                        color="primary"
                    >
                        {isInstallationLoading ? 'Installing' : 'Install'}
                    </Button>
                )}
                <>
                    <ConfirmButton
                        onConfirm={() =>
                            isLegacyInstallation
                                ? onUninstall(targetIntegrationId)
                                : onDisconnect(targetIntegrationId)
                        }
                        isDisabled={isInstallationLoading}
                        isLoading={isDisconnectionLoading}
                        intent="destructive"
                        confirmationContent={
                            hasLegacyInstallations ? (
                                <>
                                    <p>
                                        Disconnecting this store from the chat
                                        integration will also{' '}
                                        <b>disconnect all other stores.</b>
                                    </p>
                                    <p>
                                        Are you sure you want to disconnect this
                                        Shopify store for the chat integration?
                                    </p>
                                </>
                            ) : isLegacyInstallation ? (
                                <>
                                    <p>
                                        Are you sure you want to disconnect this
                                        Shopify store for the chat integration?
                                    </p>
                                </>
                            ) : isChatInstalled ? (
                                <>
                                    <p>
                                        <b>
                                            Disconnecting this chat from the
                                            store will also uninstall it
                                        </b>
                                        , removing chat from all pages.
                                    </p>
                                    <p>
                                        Are you sure you want to disconnect this
                                        Shopify store from the chat integration?
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p>
                                        If this{' '}
                                        <b>
                                            chat was manually connected to a
                                            store
                                        </b>
                                        , you will need to uninstall it to
                                        remove the chat completely.
                                    </p>
                                    <p>
                                        Are you sure you want to disconnect this
                                        Shopify store from the chat integration?
                                    </p>
                                </>
                            )
                        }
                        className={classnames({
                            [css['disconnect-button']]: true,
                        })}
                        id={`disconnect-button-${targetIntegrationId}`}
                    >
                        <i className="material-icons">delete</i>
                    </ConfirmButton>
                    <Tooltip
                        target={`disconnect-button-${targetIntegrationId}`}
                        placement="top"
                    >
                        {hasLegacyInstallations
                            ? 'Disconnecting this store from the chat integration will disconnect all other stores'
                            : isLegacyInstallation
                              ? 'Disconnecting this store from the chat integration will only disconnect this store'
                              : 'Disconnect this store from chat integration'}
                    </Tooltip>
                </>
            </div>
        </div>
    )
}
