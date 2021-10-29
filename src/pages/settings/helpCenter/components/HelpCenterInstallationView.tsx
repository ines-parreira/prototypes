import React, {useCallback, useEffect, useState} from 'react'
import axios from 'axios'
import classnames from 'classnames'
import _debounce from 'lodash/debounce'
import {useHistory, useLocation} from 'react-router-dom'
import {Button, Container} from 'reactstrap'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {
    helpCenterDeleted,
    helpCenterUpdated,
} from '../../../../state/entities/helpCenters/actions'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {ConfirmModalAction} from '../../../common/components/ConfirmModalAction'
import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import InputField from '../../../common/forms/InputField'
import {useCurrentHelpCenter} from '../hooks/useCurrentHelpCenter'
import {useHelpCenterApi} from '../hooks/useHelpCenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {getAbsoluteUrl, getHelpCenterDomain} from '../utils/helpCenter.utils'
import {
    getSubdomainValidationError,
    isValidSubdomain,
} from '../utils/validations'

import {CustomDomain} from './CustomDomain'
import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import {ImportSection} from './Imports/components/ImportSection'
import {SubdomainSection} from './SubdomainSection'

import css from './HelpCenterInstallationView.less'

export const HelpCenterInstallationView = (): JSX.Element | null => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const history = useHistory()
    const location = useLocation()
    const {helpCenter} = useCurrentHelpCenter()
    const {isReady, client} = useHelpCenterApi()
    const [subdomainValue, setSubdomainValue] = useState('')
    const [isSubdomainAvailable, setIsSubdomainAvailable] = useState(true)
    const [deleteModalConfirmation, setDeleteModalConfirmation] = useState('')

    const checkSubdomainAvailability = useCallback(
        _debounce(async () => {
            if (
                client &&
                isValidSubdomain(subdomainValue) &&
                subdomainValue !== helpCenter?.subdomain
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
                            message: 'Help Center successfully deleted',
                            status: NotificationStatus.Success,
                        })
                    )
                })
        }
    }

    const handleOnUpdateHelpCenter = () => {
        if (client) {
            void client
                .updateHelpCenter(
                    {
                        help_center_id: helpCenterId,
                    },
                    {
                        subdomain: subdomainValue,
                    }
                )
                .then((response) => {
                    dispatch(helpCenterUpdated(response.data))
                    void dispatch(
                        notify({
                            message: 'Help Center successfully updated',
                            status: NotificationStatus.Success,
                        })
                    )
                })
                .catch((err) => {
                    // TODO: Add different messages based on error response code
                    void dispatch(
                        notify({
                            message: "Couldn't update the Help Center",
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

    const deleteBtnDisabled = deleteModalConfirmation !== helpCenter?.name

    useEffect(() => {
        if (helpCenter?.subdomain) {
            setSubdomainValue(helpCenter.subdomain)
        }
    }, [helpCenter?.subdomain])

    if (!helpCenter) {
        return (
            <Container fluid className="page-container">
                <Loader />
            </Container>
        )
    }

    const subdomainError = getSubdomainValidationError(
        subdomainValue,
        isSubdomainAvailable
    )
    const isNewSubdomainValid =
        !subdomainError && subdomainValue !== helpCenter.subdomain
    const helpCenterDomain = getHelpCenterDomain(helpCenter)

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpCenterName={helpCenter?.name || ''}
                        activeLabel="Installation"
                    />
                }
            />
            <HelpCenterNavigation helpCenterId={helpCenterId} />
            <Container
                fluid
                className={classnames('page-container', css.container)}
            >
                <SubdomainSection
                    value={subdomainValue}
                    href={getAbsoluteUrl({domain: helpCenterDomain})}
                    placeholder="brand-name"
                    onChange={setSubdomainValue}
                    error={subdomainError}
                >
                    <Button
                        color="primary"
                        disabled={!isNewSubdomainValid}
                        onClick={handleOnUpdateHelpCenter}
                    >
                        Save Changes
                    </Button>
                </SubdomainSection>
                <CustomDomain />
                <ImportSection />
                <section>
                    <ConfirmModalAction
                        actions={(onClose) => (
                            <div className={css['modal-actions']}>
                                <Button
                                    onClick={() => {
                                        setDeleteModalConfirmation('')
                                        onClose()
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className={css['delete-btn']}
                                    onClick={handleOnDeleteHelpCenter}
                                    disabled={deleteBtnDisabled}
                                >
                                    <i className="material-icons">delete</i>
                                    Delete Forever
                                </Button>
                            </div>
                        )}
                        content={
                            <>
                                <p>
                                    This Help Center and its articles,
                                    categories, pages and images will be deleted
                                    permanently. Future contact form submissions
                                    will not be captured.
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
                                onClick={onClick}
                            >
                                <i className="material-icons">delete</i>
                                Delete Help Center
                            </Button>
                        )}
                    </ConfirmModalAction>
                </section>
            </Container>
        </div>
    )
}

export default HelpCenterInstallationView
