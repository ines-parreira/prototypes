import { render, screen } from '@testing-library/react'

import {
    addAttachmentsAction,
    setCustomerCustomFieldValueAction,
    setCustomFieldValueAction,
    setOpenStatusAction,
    setPriorityAction,
    setSubjectAction,
    snoozeTicketAction,
} from 'fixtures/macro'
import { MacroAction } from 'models/macroAction/types'

import { SimpleActionPreview } from '../SimpleActionPreview'

jest.mock('pages/tickets/common/macros/Preview/CustomFieldName', () => ({
    CustomFieldName: () => <div>CustomFieldName</div>,
}))

describe('<SimpleActionPreview />', () => {
    it.each([
        ['snooze', snoozeTicketAction],
        ['set subject', setSubjectAction],
        ['set status', setOpenStatusAction],
        ['add attachments', addAttachmentsAction],
        ['add custom field', setCustomFieldValueAction],
        ['add customer field', setCustomerCustomFieldValueAction],
        ['add priority', setPriorityAction],
    ])('should render %s action', (_, action: MacroAction) => {
        render(<SimpleActionPreview action={action} />)

        expect(screen.getByText(action.title)).toBeInTheDocument()
    })

    it('should skip rendering customer field preview when the field id is missing', () => {
        const action: MacroAction = {
            ...setCustomerCustomFieldValueAction,
            arguments: {
                ...setCustomerCustomFieldValueAction.arguments,
                customer_field_id: undefined,
            },
        }

        render(<SimpleActionPreview action={action} />)

        expect(screen.getByText(action.title)).toBeInTheDocument()
        expect(screen.queryByText(/Customer Field:/i)).not.toBeInTheDocument()
    })
})
