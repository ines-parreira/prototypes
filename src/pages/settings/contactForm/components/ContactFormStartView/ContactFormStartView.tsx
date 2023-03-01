import React from 'react'
import {NavLink, Redirect, Route, Switch} from 'react-router-dom'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import Detail from 'pages/integrations/components/Detail'
import {
    CONTACT_FORM_ABOUT_PATH,
    CONTACT_FORM_CREATE_PATH,
    CONTACT_FORM_FORMS_PATH,
    CONTACT_FORM_PAGE_TITLE,
} from '../../constants'
import {useContactFormList} from '../hooks/useContactFormList'
import ManageContactForms from '../ManageContactForms'
import {ManageContactFormsProps} from '../ManageContactForms/ManageContactForms'
import {CONTACT_FORM_APP_DETAIL} from './constants'

const ContactFormStartView: React.FC = () => {
    const {contactForms = [], isLoading} = useContactFormList()
    const defaultSectionPath = contactForms.length
        ? CONTACT_FORM_FORMS_PATH
        : CONTACT_FORM_ABOUT_PATH

    const manageContactFormProps: ManageContactFormsProps = {
        contactForms,
        isLoading,
    }

    return (
        <div className="full-width">
            <PageHeader title={CONTACT_FORM_PAGE_TITLE} />
            <SecondaryNavbar>
                <NavLink exact to={CONTACT_FORM_ABOUT_PATH}>
                    About
                </NavLink>
                <NavLink exact to={CONTACT_FORM_FORMS_PATH}>
                    Forms
                </NavLink>
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
