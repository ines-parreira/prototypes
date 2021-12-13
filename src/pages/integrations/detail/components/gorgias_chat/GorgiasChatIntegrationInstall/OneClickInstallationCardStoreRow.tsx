import {Button} from 'reactstrap'
import classnames from 'classnames'
import React from 'react'

import shopifyLogo from 'assets/img/integrations/shopify.png'
import warningIcon from 'assets/img/icons/warning.svg'

import Tooltip from '../../../../../common/components/Tooltip'

import css from './GorgiasChatIntegrationOneClickInstallationCard.less'

interface Props {
    isChatInstalled: boolean
    targetIntegrationId: number
    targetIntegrationName: string
    isLegacyInstallation: boolean
    isIntegrationDeactivated: boolean
    onInstall: (targetIntegrationId: number) => void
    onUninstallAndOrRemove: (
        targetIntegrationId: number,
        withUninstall: boolean,
        withRemove: boolean
    ) => void
    loading: {[key: string]: boolean}
}

export const OneClickInstallationCardStoreRow = ({
    isChatInstalled,
    targetIntegrationId,
    targetIntegrationName,
    isLegacyInstallation,
    isIntegrationDeactivated,
    onInstall,
    onUninstallAndOrRemove,
    loading,
}: Props) => {
    const getWarnings = (
        targetIntegrationId: number,
        {
            isLegacyInstallation,
            isIntegrationDeactivated,
        }: {isLegacyInstallation: boolean; isIntegrationDeactivated: boolean}
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
            {isChatInstalled ? (
                <>
                    {isIntegrationDeactivated ? (
                        <Button
                            onClick={() =>
                                onUninstallAndOrRemove(
                                    targetIntegrationId,
                                    true,
                                    true
                                )
                            }
                            className={classnames({
                                'chat-toggle-install': true,
                                'btn-loading': loading[targetIntegrationId],
                            })}
                            disabled={loading[targetIntegrationId]}
                            color="danger"
                        >
                            {loading[targetIntegrationId]
                                ? 'Disconnecting'
                                : 'Disconnect'}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                onUninstallAndOrRemove(
                                    targetIntegrationId,
                                    true,
                                    false
                                )
                            }}
                            className={classnames({
                                'chat-toggle-install': true,
                                'btn-loading': loading[targetIntegrationId],
                            })}
                            disabled={loading[targetIntegrationId]}
                            color="danger"
                        >
                            {loading[targetIntegrationId]
                                ? 'Uninstalling'
                                : 'Uninstall'}
                        </Button>
                    )}
                </>
            ) : (
                <>
                    {isIntegrationDeactivated ? (
                        <Button
                            onClick={() =>
                                onUninstallAndOrRemove(
                                    targetIntegrationId,
                                    false,
                                    true
                                )
                            }
                            className={classnames({
                                'chat-toggle-install': true,
                                'btn-loading': loading[targetIntegrationId],
                            })}
                            disabled={loading[targetIntegrationId]}
                            color="danger"
                        >
                            {loading[targetIntegrationId]
                                ? 'Disconnecting'
                                : 'Disconnect'}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onInstall(targetIntegrationId)}
                            className={classnames({
                                'chat-toggle-install': true,
                                'btn-loading': loading[targetIntegrationId],
                            })}
                            disabled={loading[targetIntegrationId]}
                            color="primary"
                        >
                            {loading[targetIntegrationId]
                                ? 'Installing'
                                : 'Install'}
                        </Button>
                    )}
                </>
            )}
        </div>
    )
}
