import React from 'react'
import classnames from 'classnames'
import {useSelector} from 'react-redux'
import {useHistory, useLocation} from 'react-router-dom'
import {Button, Container} from 'reactstrap'

import useAppDispatch from '../../../../hooks/useAppDispatch'
import {
    helpCenterDeleted,
    helpCenterUpdated,
} from '../../../../state/entities/helpCenters/actions'
import {getCurrentHelpCenter} from '../../../../state/entities/helpCenters/selectors'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {ConfirmModalAction} from '../../../common/components/ConfirmModalAction'
import PageHeader from '../../../common/components/PageHeader'
import InputField from '../../../common/forms/InputField'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'
import {useHelpCenterIdParam} from '../hooks/useHelpCenterIdParam'
import {getHelpCenterDomain} from '../utils/helpCenter.utils'
import {isValidSubdomain} from '../utils/validations'

import {CustomDomain} from './CustomDomain'
import {HelpCenterDetailsBreadcrumb} from './HelpCenterDetailsBreadcrumb'
import css from './HelpCenterInstallationView.less'
import {HelpCenterNavigation} from './HelpCenterNavigation'
import {ImportSection} from './Imports/components/ImportSection'
import {SubdomainSection} from './SubdomainSection'

// type Props = RouteComponentProps & ConnectedProps<typeof connector>

/**
 * @description
 *      This function validates the following:
 *  - if new value is not empty
 *  - if new value meets the subdomain requirements (alphanumeric and - or _)
 *  - if new value is different from the current one
 *
 * @param newValue String
 * @param currentValue String
 * @returns Boolean
 */
function validateNewSubdomain(newValue: string, currentValue: string): boolean {
    if (newValue === currentValue) {
        return false
    }

    return isValidSubdomain(newValue)
}

export const HelpCenterInstallationView = (): JSX.Element | null => {
    const dispatch = useAppDispatch()
    const helpCenterId = useHelpCenterIdParam()
    const history = useHistory()
    const location = useLocation()
    const helpCenter = useSelector(getCurrentHelpCenter)
    const {isReady, client} = useHelpcenterApi()

    const [subDomainValue, setSubdomainValue] = React.useState(
        helpCenter?.subdomain || ''
    )

    const [
        deleteModalConfirmation,
        setDeleteModalConfirmation,
    ] = React.useState('')
    const deleteBtnDisabled = deleteModalConfirmation !== helpCenter?.name

    React.useEffect(() => {
        if (helpCenter) {
            setSubdomainValue(helpCenter.subdomain)
        }
    }, [helpCenter])

    const handleOnDeleteHelpcenter = () => {
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
                            message: 'Helpcenter successfully deleted',
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
                        subdomain: subDomainValue,
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

    if (helpCenter === null) {
        return null
    }

    const subdomain = helpCenter ? helpCenter.subdomain : ''

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <HelpCenterDetailsBreadcrumb
                        helpcenterName={helpCenter?.name || ''}
                        activeLabel="Installation"
                    />
                }
            />
            <HelpCenterNavigation helpcenterId={helpCenterId} />
            <Container
                fluid
                className={classnames('page-container', css.container)}
            >
                <SubdomainSection
                    value={subDomainValue}
                    href={getHelpCenterDomain(subdomain)}
                    placeholder="brand-name"
                    onChange={setSubdomainValue}
                >
                    <Button
                        color="primary"
                        disabled={
                            !validateNewSubdomain(subDomainValue, subdomain)
                        }
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
                                    onClick={handleOnDeleteHelpcenter}
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
