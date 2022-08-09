import React, {useCallback, useEffect, useState} from 'react'
import axios from 'axios'
import _debounce from 'lodash/debounce'
import {useHistory, useLocation} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'

import {Paths} from 'rest_api/help_center_api/client.generated'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    helpCenterDeleted,
    helpCenterUpdated,
} from 'state/entities/helpCenter/helpCenters/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {ConfirmModalAction} from 'pages/common/components/ConfirmModalAction'
import InputField from 'pages/common/forms/input/InputField'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {useCurrentHelpCenter} from '../providers/CurrentHelpCenter'
import {getAbsoluteUrl, getHelpCenterDomain} from '../utils/helpCenter.utils'
import {
    getSubdomainValidationError,
    isValidSubdomain,
} from '../utils/validations'

import {ConnectToShopSection} from './ConnectToShopSection'
import {CustomDomain} from './CustomDomain'
import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import {ImportSection} from './Imports/components/ImportSection'
import {SubdomainSection} from './SubdomainSection'

import css from './HelpCenterInstallationView.less'
import GoogleAnalyticsSection from './GoogleAnalyticSection'

export const HelpCenterInstallationView: React.FC = () => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const history = useHistory()
    const location = useLocation()
    const helpCenter = useCurrentHelpCenter()
    const {isReady, client} = useHelpCenterApi()
    const [subdomainValue, setSubdomainValue] = useState<string>()
    const [gaid, setGaid] = useState<string | null>(null)
    const [isSubdomainAvailable, setIsSubdomainAvailable] = useState(true)
    const [deleteModalConfirmation, setDeleteModalConfirmation] = useState('')

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const checkSubdomainAvailability = useCallback(
        _debounce(async () => {
            if (
                client &&
                subdomainValue &&
                isValidSubdomain(subdomainValue) &&
                subdomainValue !== helpCenter.subdomain
            ) {
                try {
                    await client.checkHelpCenterWithSubdomainExists({
                        subdomain: subdomainValue,
                    })

                    setIsSubdomainAvailable(false)
                } catch (err) {
                    if (
                        axios.isAxiosError(err) &&
                        err.response?.status === 404
                    ) {
                        setIsSubdomainAvailable(true)
                    } else {
                        throw err
                    }
                }
            }
        }, 500),
        [subdomainValue]
    )

    const handleOnDeleteHelpCenter = () => {
        if (isReady && client) {
            void client
                .deleteHelpCenter({
                    help_center_id: helpCenterId,
                })
                .then(() => {
                    dispatch(helpCenterDeleted(helpCenterId))
                    history.push(
                        location.pathname.split(helpCenterId.toString())[0]
                    )
                    void dispatch(
                        notify({
                            message: 'Help Center deleted with success',
                            status: NotificationStatus.Success,
                        })
                    )
                })
        }
    }

    const handleOnUpdateHelpCenter = (
        delta: Partial<Paths.UpdateHelpCenter.RequestBody>
    ) => {
        if (client) {
            void client
                .updateHelpCenter(
                    {
                        help_center_id: helpCenterId,
                    },
                    delta
                )
                .then((response) => {
                    dispatch(helpCenterUpdated(response.data))
                    void dispatch(
                        notify({
                            message: 'Help Center updated with success',
                            status: NotificationStatus.Success,
                        })
                    )
                })
                .catch((err) => {
                    // TODO: Add different messages based on error response code
                    void dispatch(
                        notify({
                            message: 'Could not update the Help Center',
                            status: NotificationStatus.Error,
                        })
                    )
                    console.error(err)
                })
        }
    }

    useEffect(() => {
        setIsSubdomainAvailable(true)

        void checkSubdomainAvailability()

        return () => checkSubdomainAvailability.cancel()
    }, [subdomainValue, checkSubdomainAvailability])

    const deleteBtnDisabled = deleteModalConfirmation !== helpCenter.name

    useEffect(() => {
        if (helpCenter.subdomain) {
            setSubdomainValue(helpCenter.subdomain)
        }
        setGaid(helpCenter.gaid)
    }, [helpCenter.subdomain, helpCenter.gaid])

    const subdomainError = subdomainValue
        ? getSubdomainValidationError(subdomainValue, isSubdomainAvailable)
        : null
    const isNewSubdomainValid =
        subdomainValue &&
        subdomainValue !== helpCenter.subdomain &&
        !subdomainError
    const isUpdatedGaid =
        helpCenter.gaid === null ? !!gaid : helpCenter.gaid !== gaid
    const helpCenterDomain = getHelpCenterDomain(helpCenter)

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            className={css.container}
        >
            <GoogleAnalyticsSection
                gaid={gaid ?? ''}
                onChange={(value) => {
                    setGaid(value.toUpperCase())
                }}
                onDelete={
                    helpCenter.gaid
                        ? () => {
                              handleOnUpdateHelpCenter({gaid: null})
                          }
                        : null
                }
            />
            <SubdomainSection
                value={subdomainValue}
                href={getAbsoluteUrl({domain: helpCenterDomain})}
                placeholder="brand-name"
                onChange={setSubdomainValue}
                error={subdomainError}
            />
            <CustomDomain />

            <ImportSection />
            <ConnectToShopSection
                onUpdate={handleOnUpdateHelpCenter}
                helpCenter={helpCenter}
            />

            <div className={css['ctas-group']}>
                <Button
                    isDisabled={!isNewSubdomainValid && !isUpdatedGaid}
                    onClick={() =>
                        handleOnUpdateHelpCenter({
                            ...(isNewSubdomainValid
                                ? {subdomain: subdomainValue}
                                : {}),
                            ...(isUpdatedGaid ? {gaid: gaid || null} : {}),
                        })
                    }
                >
                    Save Changes
                </Button>

                <ConfirmModalAction
                    actions={(onClose) => (
                        <>
                            <Button
                                intent="secondary"
                                onClick={() => {
                                    setDeleteModalConfirmation('')
                                    onClose()
                                }}
                                className={css['cancel-btn']}
                            >
                                Cancel
                            </Button>
                            <Button
                                className={css['delete-btn']}
                                isDisabled={deleteBtnDisabled}
                                intent="secondary"
                                onClick={handleOnDeleteHelpCenter}
                            >
                                <i className="material-icons">delete</i>
                                Delete Forever
                            </Button>
                        </>
                    )}
                    content={
                        <>
                            <p>
                                This Help Center and its articles, categories,
                                pages and images will be deleted permanently.
                                Future contact form submissions will not be
                                captured.
                            </p>

                            <p>
                                <strong>
                                    Confirm by typing{' '}
                                    <span
                                        className={
                                            css['delete-modal-help-center']
                                        }
                                    >
                                        {helpCenter.name}
                                    </span>{' '}
                                    below
                                </strong>
                            </p>

                            <InputField
                                type="text"
                                className={css['delete-modal-input']}
                                name="help-center-delete-confirmation"
                                placeholder={'[Help Center Name]'}
                                value={deleteModalConfirmation}
                                onChange={setDeleteModalConfirmation}
                            />
                        </>
                    }
                    title="Delete confirmation"
                >
                    {(onClick) => (
                        <Button
                            className={css['delete-btn']}
                            intent="secondary"
                            onClick={onClick}
                        >
                            <i className="material-icons">delete</i>
                            Delete Help Center
                        </Button>
                    )}
                </ConfirmModalAction>
            </div>
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterInstallationView
