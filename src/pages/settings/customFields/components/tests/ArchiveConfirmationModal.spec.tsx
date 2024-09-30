import React from 'react'
import {render} from '@testing-library/react'
import noop from 'lodash/noop'

import {OBJECT_TYPES} from 'models/customField/constants'

import ArchiveConfirmationModal from '../ArchiveConfirmationModal'

describe('<ArchiveConfirmationModal/>', () => {
    it('should render', () => {
        const {baseElement} = render(
            <ArchiveConfirmationModal
                customFieldLabel="Foo"
                isOpen
                onConfirm={noop}
                onClose={noop}
                objectType={OBJECT_TYPES.TICKET}
            />
        )
        expect(baseElement).toMatchSnapshot()
    })
})
