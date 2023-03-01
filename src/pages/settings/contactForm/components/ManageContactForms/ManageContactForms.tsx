import React from 'react'
import {useHistory} from 'react-router-dom'
import {Container} from 'reactstrap'
import Button from 'pages/common/components/button/Button'
import css from 'pages/settings/helpCenter/components/HelpCenterStartView/HelpCenterStartView.less'
import settingsCss from '../../../settings.less'
import {CONTACT_FORM_CREATE_PATH} from '../../constants'

export type ManageContactFormsProps = {
    contactForms: any[]
    isLoading: boolean
}

const ManageContactForms = ({
    isLoading,
    contactForms = [],
}: ManageContactFormsProps) => {
    const history = useHistory()
    const handleAddHelpCenter = () => {
        history.push(CONTACT_FORM_CREATE_PATH)
    }

    const IS_BUTTON_DISABLED = false

    if (!isLoading && !contactForms.length) {
        return (
            <Container fluid className={settingsCss.pageContainer}>
                <p>You have no contact forms at the moment.</p>
                <Button
                    isDisabled={IS_BUTTON_DISABLED}
                    onClick={handleAddHelpCenter}
                >
                    <div className={css.createNewButton}>
                        <i className="material-icons mr-2">add</i>Create Form
                    </div>
                </Button>
            </Container>
        )
    }

    return null
}

export default ManageContactForms
