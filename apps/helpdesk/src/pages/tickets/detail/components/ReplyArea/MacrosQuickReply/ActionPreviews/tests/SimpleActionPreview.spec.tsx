import { render, screen } from '@testing-library/react'

import {
    addAttachmentsAction,
    setCustomFieldValueAction,
    setOpenStatusAction,
    setPriorityAction,
    setSubjectAction,
    snoozeTicketAction,
} from 'fixtures/macro'
import { MacroAction } from 'models/macroAction/types'

import { SimpleActionPreview } from '../SimpleActionPreview'

jest.mock('pages/tickets/common/macros/Preview.tsx', () => ({
    CustomFieldName: () => <div>CustomFieldName</div>,
}))

describe('<SimpleActionPreview />', () => {
    it.each([
        ['snooze', snoozeTicketAction],
        ['set subject', setSubjectAction],
        ['set status', setOpenStatusAction],
        ['add attachments', addAttachmentsAction],
        ['add custom field', setCustomFieldValueAction],
        ['add priority', setPriorityAction],
    ])('should render %s action', (_, action: MacroAction) => {
        render(<SimpleActionPreview action={action} />)

        expect(screen.getByText(action.title)).toBeInTheDocument()
    })
})
