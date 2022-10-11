import {render} from '@testing-library/react'

import {fromJS} from 'immutable'

import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'

import Preview from '../Preview'
import {
    addInternalNoteAction,
    addTagsAction,
} from '../../../../../fixtures/macro'

const flags = {
    [FeatureFlagKey.MacroForwardByEmail]: true,
}

const defaultProps = {
    flags,
}

describe('<Preview />', () => {
    it('should render simple action preview', () => {
        const {container} = render(
            <Preview {...defaultProps} actions={fromJS([addTagsAction])} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render backend action preview', () => {
        const {container} = render(
            <Preview
                {...defaultProps}
                actions={fromJS([addInternalNoteAction])}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should multiple actions preview', () => {
        const {container} = render(
            <Preview
                {...defaultProps}
                actions={fromJS([addTagsAction, addInternalNoteAction])}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
