import classnames from 'classnames'
import React, {useState, FormEvent} from 'react'
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
    Label,
} from 'reactstrap'

import {validLocaleCode} from '../../../../models/helpCenter/utils'

import Loader from '../../../common/components/Loader/Loader'
import PageHeader from '../../../common/components/PageHeader'
import InputField from '../../../common/forms/InputField.js'
import SelectField from '../../../common/forms/SelectField/SelectField'
import {FlagLanguageItem} from '../../../common/components/LanguageBulletList'

import {CreateHelpcenterDto} from '../../../../models/helpCenter/types'

import {helpCenterCreated} from '../../../../state/entities/helpCenters/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {notify as notifyAction} from '../../../../state/notifications/actions'

import {useLocales} from '../hooks/useLocales'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'
import {HELP_CENTER_BASE_PATH, HELP_CENTER_LANGUAGE_DEFAULT} from '../constants'

import css from './HelpCenterNewView.less'

type Props = ConnectedProps<typeof connector>

const initialFormState: CreateHelpcenterDto = {
    name: '',
    default_locale: HELP_CENTER_LANGUAGE_DEFAULT,
}

export const HelpCenterNewView = ({notify, helpCenterCreated}: Props) => {
    const history = useHistory()
    const location = useLocation()
    const locales = useLocales()
    const {client} = useHelpcenterApi()
    const [newHelpCenter, setNewHelpCenter] = useState<CreateHelpcenterDto>(
        initialFormState
    )
    const [isLoading, setIsLoading] = useState(false)
    const localeOptions = locales.map((locale) => ({
        label: <FlagLanguageItem code={locale.code} name={locale.name} />,
        text: locale.name,
        value: locale.code,
    }))

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!client) {
            return
        }
        setIsLoading(true)
        try {
            const {data: createdHelpCenter} = await client.createHelpCenter(
                null,
                newHelpCenter
            )
            helpCenterCreated(createdHelpCenter)
            resetForm()

            history.push(location.pathname.split('/new')[0])

            void notify({
                message: 'Help center successfully created',
                status: NotificationStatus.Success,
            })
        } catch (err) {
            void notify({
                message: 'Failed to create the help center',
                status: NotificationStatus.Error,
            })
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOnSelect = (value: React.ReactText) => {
        setNewHelpCenter((prevNewHelpCenter) => ({
            ...prevNewHelpCenter,
            default_locale: validLocaleCode(value),
        }))
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
                    <span data-testid="loading">
                        <Loader />
                    </span>
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
                                <Label
                                    htmlFor="language-select"
                                    className="control-label"
                                >
                                    Default language
                                </Label>
                                <div
                                    id="language-select"
                                    style={{marginBottom: 32}}
                                >
                                    <SelectField
                                        options={localeOptions}
                                        value={newHelpCenter.default_locale}
                                        onChange={handleOnSelect}
                                        style={{
                                            display: 'inline-block',
                                        }}
                                    />
                                </div>
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
    notify: notifyAction,
})

export default connector(HelpCenterNewView)
