import React, {useCallback, useEffect, useState} from 'react'
import axios from 'axios'
import _debounce from 'lodash/debounce'
import {useHistory, useLocation} from 'react-router-dom'

import Button from 'pages/common/components/button/Button'

import {Paths} from 'rest_api/help_center_api/client.generated'

import warningIcon from 'assets/img/icons/warning2.svg'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    helpCenterDeleted,
    helpCenterUpdated,
} from 'state/entities/helpCenter/helpCenters/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {ConfirmModalAction} from 'pages/common/components/ConfirmModalAction'
import InputField from 'pages/common/forms/input/InputField'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import {AlertType} from 'pages/common/components/Alert/Alert'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {useCurrentHelpCenter} from '../providers/CurrentHelpCenter'
import {
    getSubdomainValidationError,
    isValidSubdomain,
} from '../utils/validations'

import {CustomDomain} from './CustomDomain'
import HelpCenterPageWrapper from './HelpCenterPageWrapper'
import {SubdomainSection} from './SubdomainSection'

import css from './HelpCenterPublishAndTrackView.less'
import GoogleAnalyticsSection from './GoogleAnalyticSection'
import CloseTabModal from './CloseTabModal'
import {UpdateToggle} from './UpdateToggle'

export const HelpCenterInstallationView: React.FC = () => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const history = useHistory()
    const location = useLocation()
    const helpCenter = useCurrentHelpCenter()
    const {client} = useHelpCenterApi()
    const [subdomainValue, setSubdomainValue] = useState<string>()
    const [gaid, setGaid] = useState<string | null>(null)
    const [isSubdomainAvailable, setIsSubdomainAvailable] = useState(true)
    const [deleteModalConfirmation, setDeleteModalConfirmation] = useState('')
    const [showWarning, setShowWarning] = useState(true)

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
        if (client) {
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

    const handleOnCancel = () => {
        setSubdomainValue(helpCenter.subdomain)
        setGaid(helpCenter.gaid)
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

    return (
        <HelpCenterPageWrapper
            helpCenter={helpCenter}
            className={css.container}
        >
            <section className="mb-4">
                <h3 className={css.sectionTitle}>Publish</h3>
                <UpdateToggle
                    activated={!Boolean(helpCenter.deactivated_datetime)}
                    description="Publishing Help Center only makes it available to anyone with the direct link. It does not make it automatically available to your customers until you add the link to Help Center on your website."
                    fieldName="deactivated"
                    label="Publish Help Center"
                />
                {showWarning && (
                    <LinkAlert
                        actionLabel="Learn more"
                        type={AlertType.Warning}
                        className={css.alert}
                        actionHref="https://docs.gorgias.com/en-US/help-center---setup-81865#link-to-shopify"
                        onClose={() => {
                            setShowWarning(false)
                        }}
                    >
                        <div className={css.alertContent}>
                            <img src={warningIcon} alt="warning icon" />
                            <div>
                                Don't forget to connect Help Center to your
                                website.
                            </div>
                        </div>
                    </LinkAlert>
                )}
            </section>
            <SubdomainSection
                value={subdomainValue}
                caption="This is the URL that can be used to access your help center."
                placeholder="brand-name"
                onChange={setSubdomainValue}
                error={subdomainError}
            />
            <CustomDomain />
            <section className="mb-4">
                <h3 className={css.sectionTitle}>Track</h3>
            </section>
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

            <div className={css.ctasGroup}>
                <div className={css.leftSideButtons}>
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
                    <Button intent="secondary" onClick={handleOnCancel}>
                        Cancel
                    </Button>
                </div>

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
            <CloseTabModal
                when={isNewSubdomainValid || isUpdatedGaid}
                onSave={() =>
                    handleOnUpdateHelpCenter({
                        ...(isNewSubdomainValid
                            ? {subdomain: subdomainValue}
                            : {}),
                        ...(isUpdatedGaid ? {gaid} : {}),
                    })
                }
            />
        </HelpCenterPageWrapper>
    )
}

export default HelpCenterInstallationView
