import React from 'react'
import {NavLink, Redirect, Route, Switch, useHistory} from 'react-router-dom'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import Detail from 'pages/integrations/components/Detail'
import {
    CONTACT_FORM_ABOUT_PATH,
    CONTACT_FORM_CREATE_PATH,
    CONTACT_FORM_FORMS_PATH,
    CONTACT_FORM_PAGE_TITLE,
} from 'pages/settings/contactForm/constants'
import {usePaginatedContactForms} from 'pages/settings/contactForm/hooks/usePaginatedContactForms'
import ManageContactForms from 'pages/settings/contactForm/views/ContactFormStartView/ManageContactForms'
import {Props} from 'pages/settings/contactForm/views/ContactFormStartView/ManageContactForms/ManageContactForms'
import {CONTACT_FORM_APP_DETAIL} from 'pages/settings/contactForm/views/ContactFormStartView/constants'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'

const navLinks = {
    About: CONTACT_FORM_ABOUT_PATH,
    Forms: CONTACT_FORM_FORMS_PATH,
}

const ContactFormStartView: React.FC = () => {
    const history = useHistory()
    const handleAddHelpCenter = () => history.push(CONTACT_FORM_CREATE_PATH)
    const {contactForms = [], isLoading} = usePaginatedContactForms()
    const defaultSectionPath = contactForms.length
        ? CONTACT_FORM_FORMS_PATH
        : CONTACT_FORM_ABOUT_PATH

    const manageContactFormProps: Props = {
        contactForms,
        isLoading,
    }

    return (
        <div className="full-width">
            <PageHeader title={CONTACT_FORM_PAGE_TITLE}>
                {isLoading || contactForms.length <= 0 ? null : (
                    <Route exact path={CONTACT_FORM_FORMS_PATH}>
                        <Button
                            aria-label="create-form-nav"
                            onClick={handleAddHelpCenter}
                        >
                            <ButtonIconLabel icon="add">
                                Create Form
                            </ButtonIconLabel>
                        </Button>
                    </Route>
                )}
            </PageHeader>
            <SecondaryNavbar>
                {Object.entries(navLinks).map(([name, to]) => (
                    <NavLink exact key={name} to={to}>
                        {name}
                    </NavLink>
                ))}
            </SecondaryNavbar>
            <Switch>
                <Route exact path={CONTACT_FORM_ABOUT_PATH}>
                    <Detail
                        {...CONTACT_FORM_APP_DETAIL}
                        connectUrl={`${location.origin}${CONTACT_FORM_CREATE_PATH}`}
                    />
                </Route>
                <Route exact path={CONTACT_FORM_FORMS_PATH}>
                    <ManageContactForms {...manageContactFormProps} />
                </Route>
                <Route
                    exact
                    render={() => <Redirect to={defaultSectionPath} />}
                />
            </Switch>
        </div>
    )
}

export default ContactFormStartView
