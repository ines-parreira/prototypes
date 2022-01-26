import {render} from '@testing-library/react'

import {fromJS} from 'immutable'

import React from 'react'
import Preview from '../Preview.js'
import {
    addInternalNoteAction,
    addTagsAction,
} from '../../../../../fixtures/macro'

describe('<Preview />', () => {
    it('should render simple action preview', () => {
        const {container} = render(
            <Preview actions={fromJS([addTagsAction])} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render backend action preview', () => {
        const {container} = render(
            <Preview actions={fromJS([addInternalNoteAction])} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should multiple actions preview', () => {
        const {container} = render(
            <Preview actions={fromJS([addTagsAction, addInternalNoteAction])} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
