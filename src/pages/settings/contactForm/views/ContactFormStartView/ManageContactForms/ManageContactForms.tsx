import React from 'react'
import {useHistory} from 'react-router-dom'
import {Container} from 'reactstrap'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import Button from 'pages/common/components/button/Button'
import settingsCss from 'pages/settings/settings.less'
import {
    CONTACT_FORM_CREATE_PATH,
    CONTACT_FORM_APPEARANCE_PATH,
} from 'pages/settings/contactForm/constants'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import {ContactForm} from 'models/contactForm/types'
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import {LanguageList} from 'pages/common/components/LanguageBulletList'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import css from './ManageContactForms.less'

export type Props = {
    contactForms: ContactForm[]
    isLoading: boolean
}

const ManageContactForms = ({isLoading, contactForms = []}: Props) => {
    const history = useHistory()
    const navigateToCreateContactForm = () =>
        history.push(CONTACT_FORM_CREATE_PATH)
    const navigateToContactFormAppearance = (id: number) =>
        history.push(insertContactFormIdParam(CONTACT_FORM_APPEARANCE_PATH, id))

    if (!isLoading && !contactForms.length) {
        return (
            <Container fluid className={settingsCss.pageContainer}>
                <p>You have no contact forms at the moment.</p>
                <Button
                    onClick={navigateToCreateContactForm}
                    aria-label="create-form-bottom"
                >
                    <div className={css.createNewButton}>
                        <i className="material-icons mr-2">add</i>Create Form
                    </div>
                </Button>
            </Container>
        )
    }

    return (
        <Container fluid className={contactFormCss.px0}>
            <TableWrapper>
                <TableHead className={css.contactFormsTableHead}>
                    <HeaderCellProperty
                        style={{width: '45%'}}
                        title="Form Name"
                    />
                    <HeaderCellProperty title="Language" />
                    <HeaderCell />
                </TableHead>
                <TableBody>
                    {contactForms.map((form) => {
                        // TODO: use actual name
                        const language = {
                            name: '',
                            code: form.default_locale,
                        }
                        return (
                            <TableBodyRow
                                key={form.id}
                                onClick={() =>
                                    navigateToContactFormAppearance(form.id)
                                }
                            >
                                <BodyCell>
                                    <b>{form.name}</b>
                                </BodyCell>
                                <BodyCell>
                                    <LanguageList
                                        id={form.id}
                                        defaultLanguage={language}
                                        languageList={[language]}
                                    />
                                </BodyCell>
                                <BodyCell>
                                    <i className="material-icons md-2">
                                        keyboard_arrow_right
                                    </i>
                                </BodyCell>
                            </TableBodyRow>
                        )
                    })}
                </TableBody>
            </TableWrapper>
        </Container>
    )
}

export default ManageContactForms
