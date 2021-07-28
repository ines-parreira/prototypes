import classnames from 'classnames'
import React, {useState, useEffect, FormEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, useHistory, useLocation} from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Form,
    Row,
    Col,
    Button,
} from 'reactstrap'

import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import InputField from '../../../common/forms/InputField.js'
import {HELP_CENTER_BASE_PATH, HELP_CENTER_LANGUAGE_DEFAULT} from '../constants'
import {getLocalesResponseFixture} from '../fixtures/getLocalesResponse.fixtures'
import {
    HelpCenterLocale,
    CreateHelpcenterDto,
    LocaleCode,
} from '../../../../models/helpCenter/types'
import {helpCenterCreated} from '../../../../state/entities/helpCenters/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {notify} from '../../../../state/notifications/actions'
import {
    getHelpCenterClient,
    HelpCenterClient,
} from '../../../../../../../rest_api/help_center_api/index'

import css from './HelpCenterNewView.less'
import LanguageSelect from './newView/LanguageSelect'

type Props = ConnectedProps<typeof connector>

const initialFormState: CreateHelpcenterDto = {
    name: '',
    default_locale: HELP_CENTER_LANGUAGE_DEFAULT as LocaleCode,
}

let helpCenterClient: HelpCenterClient

export const HelpCenterNewView = ({helpCenterCreated}: Props) => {
    const history = useHistory()
    const location = useLocation()
    const [newHelpCenter, setNewHelpCenter] = useState<CreateHelpcenterDto>(
        initialFormState
    )
    const [isLoading, setIsLoading] = useState(false)
    const [localeOptions, setLocaleOptions] = useState<HelpCenterLocale[]>([])

    useEffect(() => {
        async function init() {
            setIsLoading(true)
            try {
                helpCenterClient = await getHelpCenterClient()
                // Retrieve the default locale options from the API
                setLocaleOptions(
                    getLocalesResponseFixture as HelpCenterLocale[]
                )
            } catch (err) {
                notify({
                    message:
                        "Failed to retrieve the help center's locales list",
                    status: NotificationStatus.Error,
                })
            } finally {
                setIsLoading(false)
            }
        }

        void init()
    }, [])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)
        try {
            const {
                data: createdHelpCenter,
            } = await helpCenterClient.createHelpCenter(null, newHelpCenter)
            helpCenterCreated(createdHelpCenter)
            resetForm()

            history.push(location.pathname.split('/new')[0])

            notify({
                message: 'Help center successfully created',
                status: NotificationStatus.Success,
            })
        } catch (err) {
            notify({
                message: 'Failed to create the help center',
                status: NotificationStatus.Error,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setNewHelpCenter(initialFormState)
    }

    const canReset = Object.keys(newHelpCenter).reduce(
        (canResetAcc, currentKey) => {
            if (canResetAcc) {
                return true
            }

            return (
                newHelpCenter[currentKey as keyof CreateHelpcenterDto] !==
                initialFormState[currentKey as keyof CreateHelpcenterDto]
            )
        },
        false
    )

    const canSubmit = Object.keys(newHelpCenter).reduce(
        (canSubmitAcc, currentKey) =>
            canSubmitAcc &&
            Boolean(newHelpCenter[currentKey as keyof CreateHelpcenterDto]),
        true
    )

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to={HELP_CENTER_BASE_PATH}>Help Center</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>New Help Center</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <Container fluid className="page-container">
                {isLoading ? (
                    <Loader />
                ) : (
                    <Form className="mb-4" onSubmit={handleSubmit}>
                        <Row>
                            <Col md="9">
                                <InputField
                                    type="text"
                                    name="name"
                                    label="Help Center name"
                                    help="This is going to be displayed whenever your logo isn’t available and also in search engines."
                                    placeholder="Ex. Customer Support"
                                    className={classnames(css.formInput)}
                                    required
                                    value={newHelpCenter.name}
                                    onChange={(name: string) =>
                                        setNewHelpCenter(
                                            (prevNewHelpCenter) => ({
                                                ...prevNewHelpCenter,
                                                name,
                                            })
                                        )
                                    }
                                />
                                <LanguageSelect
                                    label="Default language"
                                    value={newHelpCenter.default_locale}
                                    options={localeOptions}
                                    className={css.formInput}
                                    onChange={(default_locale) =>
                                        setNewHelpCenter(
                                            (prevNewHelpCenter) => ({
                                                ...prevNewHelpCenter,
                                                default_locale,
                                            })
                                        )
                                    }
                                />
                            </Col>
                        </Row>
                        <Button
                            type="submit"
                            color="success"
                            disabled={!canSubmit}
                        >
                            Add new Helpcenter
                        </Button>
                        <Button
                            className={css.cancelButton}
                            onClick={resetForm}
                            disabled={!canReset}
                        >
                            Cancel
                        </Button>
                    </Form>
                )}
            </Container>
        </div>
    )
}

const connector = connect(null, {
    helpCenterCreated,
    notify,
})

export default connector(HelpCenterNewView)
