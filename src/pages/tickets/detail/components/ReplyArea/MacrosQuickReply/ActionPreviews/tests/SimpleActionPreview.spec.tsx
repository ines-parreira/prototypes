import React from 'react'
import {render} from '@testing-library/react'

import {
    snoozeTicketAction,
    setSubjectAction,
    setOpenStatusAction,
    addAttachmentsAction,
} from '../../../../../../../../fixtures/macro'
import {SimpleActionPreview} from '../SimpleActionPreview'
import {MacroAction} from '../../../../../../../../models/macroAction/types'

describe('<SimpleActionPreview/>', () => {
    it.each([
        ['snooze', snoozeTicketAction],
        ['set subject', setSubjectAction],
        ['set status', setOpenStatusAction],
        ['add attachmeents', addAttachmentsAction],
    ])('should render %s action', (_, action: MacroAction) => {
        const {container} = render(<SimpleActionPreview action={action} />)
        expect(container.firstChild).toMatchSnapshot()
    })
})
