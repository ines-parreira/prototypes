import classnames from 'classnames'
import React, {useState} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Link, useHistory, useLocation} from 'react-router-dom'
import {
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Row,
    Col,
    Button,
    Label,
} from 'reactstrap'
import produce from 'immer'

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

import {SubdomainInput} from '../components/SubdomainSection'

import {useLocales} from '../hooks/useLocales'
import {useHelpcenterApi} from '../hooks/useHelpcenterApi'
import {isValidSubdomain} from '../utils/validations'

import {
    DEFAULT_THEME,
    HELP_CENTER_BASE_PATH,
    HELP_CENTER_DEFAULT_COLOR,
    HELP_CENTER_LANGUAGE_DEFAULT,
} from '../constants'
import {HelpCenterThemes} from '../types'

import {ThemeSwitch} from './ThemeSwitch'

import css from './HelpCenterNewView.less'

type Props = ConnectedProps<typeof connector>

type CreateHelpCenterPayload = CreateHelpcenterDto & {
    theme: HelpCenterThemes
    primary_color: string
}

const initialFormState: CreateHelpCenterPayload = {
    name: '',
    subdomain: '',
    default_locale: HELP_CENTER_LANGUAGE_DEFAULT,
    theme: DEFAULT_THEME,
    primary_color: HELP_CENTER_DEFAULT_COLOR,
}

export const HelpCenterNewView = ({notify, helpCenterCreated}: Props) => {
    const history = useHistory()
    const location = useLocation()
    const locales = useLocales()
    const {client} = useHelpcenterApi()
    const [newHelpCenter, setNewHelpCenter] = useState<CreateHelpCenterPayload>(
        initialFormState
    )
    const [isLoading, setIsLoading] = useState(false)
    const localeOptions = locales.map((locale) => ({
        label: <FlagLanguageItem code={locale.code} name={locale.name} />,
        text: locale.name,
        value: locale.code,
    }))

    const handleSubmit = async () => {
        if (!client) {
            return
        }
        setIsLoading(true)
        try {
            const payload = produce(newHelpCenter, (draft) => {
                if (draft.subdomain === '') {
                    delete draft.subdomain
                }
            })
            const {data: createdHelpCenter} = await client.createHelpCenter(
                null,
                payload
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

    const canSubmit = () => {
        if (!newHelpCenter.name) {
            return false
        }

        if (
            newHelpCenter?.subdomain &&
            !isValidSubdomain(newHelpCenter?.subdomain)
        ) {
            return false
        }

        return true
    }

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
            <Container
                fluid
                className="page-container"
                style={{maxWidth: 680, marginLeft: 0}}
            >
                {isLoading ? (
                    <span data-testid="loading">
                        <Loader />
                    </span>
                ) : (
                    <section>
                        <Row>
                            <Col md="6">
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
                            </Col>
                            <Col md="6">
                                <SubdomainInput
                                    help="This is the URL for your Help center. If you don't provide a value, we will generate one for you."
                                    hasError={
                                        newHelpCenter?.subdomain
                                            ? !isValidSubdomain(
                                                  newHelpCenter?.subdomain
                                              )
                                            : false
                                    }
                                    value={newHelpCenter?.subdomain}
                                    onChange={(subdomain: string) =>
                                        setNewHelpCenter(
                                            (prevNewHelpCenter) => ({
                                                ...prevNewHelpCenter,
                                                subdomain,
                                            })
                                        )
                                    }
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col xs={12}>
                                <h3>Languages</h3>
                                <p>
                                    Choose the default language that will be
                                    used every time it’s not detected or as a
                                    second option if the selected language isn’t
                                    available.
                                </p>
                            </Col>
                            <Col xs={12}>
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

                        <Row>
                            <Col xs={12}>
                                <h3>Appearance</h3>
                                <ThemeSwitch
                                    selectedTheme={newHelpCenter.theme}
                                    currentColor={newHelpCenter.primary_color}
                                    onThemeChange={(theme) => {
                                        setNewHelpCenter(
                                            (prevNewHelpCenter) => ({
                                                ...prevNewHelpCenter,
                                                theme,
                                            })
                                        )
                                    }}
                                    onColorChange={(color) => {
                                        setNewHelpCenter(
                                            (prevNewHelpCenter) => ({
                                                ...prevNewHelpCenter,
                                                primary_color: color,
                                            })
                                        )
                                    }}
                                />
                            </Col>
                        </Row>

                        <Row className="pb-4">
                            <Col>
                                <Button
                                    color="success"
                                    disabled={!canSubmit()}
                                    onClick={handleSubmit}
                                >
                                    Add new Helpcenter
                                </Button>
                                <Button
                                    className={css.cancelButton}
                                    disabled={!canReset}
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                            </Col>
                        </Row>
                    </section>
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
