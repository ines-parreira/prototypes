import React from 'react'
import {render} from '@testing-library/react'

import {
    snoozeTicketAction,
    setCustomFieldValueAction,
    setSubjectAction,
    setOpenStatusAction,
    addAttachmentsAction,
} from 'fixtures/macro'
import {MacroAction} from 'models/macroAction/types'

import {SimpleActionPreview} from '../SimpleActionPreview'

jest.mock('pages/tickets/common/macros/Preview.tsx', () => ({
    CustomFieldName: () => <div>CustomFieldName</div>,
}))

describe('<SimpleActionPreview/>', () => {
    it.each([
        ['snooze', snoozeTicketAction],
        ['set subject', setSubjectAction],
        ['set status', setOpenStatusAction],
        ['add attachmeents', addAttachmentsAction],
        ['add custom field', setCustomFieldValueAction],
    ])('should render %s action', (_, action: MacroAction) => {
        const {container} = render(<SimpleActionPreview action={action} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
