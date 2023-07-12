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
    CONTACT_FORM_CUSTOMIZATION_PATH,
} from 'pages/settings/contactForm/constants'
import contactFormCss from 'pages/settings/contactForm/contactForm.less'
import {ContactForm} from 'models/contactForm/types'
import {insertContactFormIdParam} from 'pages/settings/contactForm/utils/navigation'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import css from './ManageContactForms.less'
import {ContactFormTableRow} from './ContactFormTableRow'

export type Props = {
    contactForms: ContactForm[]
    isLoading: boolean
    fetchMore: () => Promise<any>
    hasMore: boolean
}

const ManageContactForms = ({
    isLoading,
    contactForms = [],
    fetchMore,
    hasMore,
}: Props) => {
    const history = useHistory()
    const navigateToCreateContactForm = () =>
        history.push(CONTACT_FORM_CREATE_PATH)
    const navigateToContactFormCustomization = (id: number) =>
        history.push(
            insertContactFormIdParam(CONTACT_FORM_CUSTOMIZATION_PATH, id)
        )

    if (!isLoading && contactForms.length === 0) {
        return (
            <Container fluid className={settingsCss.pageContainer}>
                <p>You have no contact forms at the moment.</p>
                <Button
                    onClick={navigateToCreateContactForm}
                    aria-label="create-form-bottom"
                >
                    <div className={css.createNewButton}>
                        Create Contact Form
                    </div>
                </Button>
            </Container>
        )
    }

    return (
        <div className={css.infiniteScrollWrapper}>
            <InfiniteScroll
                onLoad={fetchMore}
                shouldLoadMore={!isLoading && hasMore}
                className={css.infiniteScroll}
            >
                <Container fluid className={contactFormCss.px0}>
                    <TableWrapper>
                        <TableHead className={css.contactFormsTableHead}>
                            <HeaderCellProperty
                                style={{width: '35%'}}
                                title="Form Name"
                            />
                            <HeaderCellProperty
                                style={{width: '20%'}}
                                title="Store"
                            />
                            <HeaderCellProperty title="Language" />
                            <HeaderCell />
                        </TableHead>
                        <TableBody>
                            {contactForms.map((form) => (
                                <ContactFormTableRow
                                    key={form.id}
                                    form={form}
                                    onClick={() => {
                                        navigateToContactFormCustomization(
                                            form.id
                                        )
                                    }}
                                />
                            ))}
                        </TableBody>
                    </TableWrapper>
                </Container>
            </InfiniteScroll>
        </div>
    )
}

export default ManageContactForms
