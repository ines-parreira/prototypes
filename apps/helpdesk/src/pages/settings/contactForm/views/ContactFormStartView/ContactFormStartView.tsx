import React, { useEffect, useMemo } from 'react'

import { reportError } from '@repo/logging'
import _flatten from 'lodash/flatten'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'
import {
    Link,
    NavLink,
    Redirect,
    Route,
    Switch,
    useHistory,
} from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import PageHeader from 'pages/common/components/PageHeader'
import Detail from 'pages/common/components/ProductDetail'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {
    CONTACT_FORM_ABOUT_PATH,
    CONTACT_FORM_CREATE_PATH,
    CONTACT_FORM_FORMS_PATH,
    CONTACT_FORM_PAGE_TITLE,
} from 'pages/settings/contactForm/constants'
import { CONTACT_FORM_APP_DETAIL } from 'pages/settings/contactForm/views/ContactFormStartView/constants'
import ManageContactForms from 'pages/settings/contactForm/views/ContactFormStartView/ManageContactForms'
import { notify as notifyAction } from 'state/notifications/actions'
import { notEmpty } from 'utils'

import { NotificationStatus } from '../../../../../state/notifications/types'
import { useGetContactFormList } from '../../queries'

const CONTACT_FORM_HOME_ROUTES = {
    About: CONTACT_FORM_ABOUT_PATH,
    Forms: CONTACT_FORM_FORMS_PATH,
}

const CONTACT_FORM_DETAIL_PROPS: typeof CONTACT_FORM_APP_DETAIL = {
    ...CONTACT_FORM_APP_DETAIL,
    infocard: {
        ...CONTACT_FORM_APP_DETAIL.infocard,
        CTA: (
            <Link to={CONTACT_FORM_CREATE_PATH}>
                <Button className="full-width">Create Contact Form</Button>
            </Link>
        ),
    },
}

type ContactFormStartViewProps = ConnectedProps<typeof connector>

const ContactFormStartView = ({
    notify,
}: ContactFormStartViewProps): JSX.Element => {
    const history = useHistory()
    const handleAddHelpCenter = () => history.push(CONTACT_FORM_CREATE_PATH)

    const getContactFormList = useGetContactFormList({
        retry: false,
    })

    useEffect(() => {
        if (getContactFormList.isError && getContactFormList.error) {
            void notify({
                status: NotificationStatus.Error,
                message: 'Failed to fetch Contact Forms',
            })
            // redirect to the about page
            history.push(CONTACT_FORM_HOME_ROUTES.About)
            reportError(
                new Error('Failed to fetch Contact Forms'),
                getContactFormList.error instanceof Error
                    ? { extra: { message: getContactFormList.error.message } }
                    : undefined,
            )
        }
    }, [getContactFormList.error, getContactFormList.isError, history, notify])

    // until the first request is done, we don't know how many manual contact forms to display
    // so we return null until we have the data
    const contactForms = useMemo(() => {
        if (getContactFormList.status !== 'success' || !getContactFormList.data)
            return null

        const allContactFormListPageDto = getContactFormList.data.pages
            .filter(notEmpty)
            .map((page) => page.data)

        const allContactForms = _flatten(allContactFormListPageDto).filter(
            notEmpty,
        )

        return allContactForms.filter((cf) => cf.source === 'manual')
    }, [getContactFormList.data, getContactFormList.status])

    return (
        <div className="full-width">
            <PageHeader title={CONTACT_FORM_PAGE_TITLE}>
                {getContactFormList.isLoading || !contactForms ? null : (
                    <Route exact path={CONTACT_FORM_HOME_ROUTES.Forms}>
                        <Button
                            aria-label="create-form-nav"
                            onClick={handleAddHelpCenter}
                        >
                            Create Contact Form
                        </Button>
                    </Route>
                )}
            </PageHeader>
            <SecondaryNavbar>
                {Object.entries(CONTACT_FORM_HOME_ROUTES).map(([name, to]) => (
                    <NavLink exact key={name} to={to}>
                        {name}
                    </NavLink>
                ))}
            </SecondaryNavbar>
            <Switch>
                <Route exact path={CONTACT_FORM_HOME_ROUTES.About}>
                    <Detail {...CONTACT_FORM_DETAIL_PROPS} />
                </Route>
                <Route exact path={CONTACT_FORM_HOME_ROUTES.Forms}>
                    <ManageContactForms
                        isLoading={getContactFormList.isInitialLoading}
                        contactForms={contactForms || []}
                        fetchMore={getContactFormList.fetchNextPage}
                        hasMore={Boolean(getContactFormList.hasNextPage)}
                    />
                </Route>
                {contactForms && (
                    <Redirect
                        to={
                            contactForms.length
                                ? CONTACT_FORM_HOME_ROUTES.Forms
                                : CONTACT_FORM_HOME_ROUTES.About
                        }
                    />
                )}
            </Switch>
        </div>
    )
}

const connector = connect(null, {
    notify: notifyAction,
})

export default connector(ContactFormStartView)
