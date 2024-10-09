import {render} from '@testing-library/react'
import noop from 'lodash/noop'
import React from 'react'

import {OBJECT_TYPES} from 'custom-fields/constants'

import ArchiveConfirmationModal from '../ArchiveConfirmationModal'

describe('<ArchiveConfirmationModal/>', () => {
    it.each(Object.values(OBJECT_TYPES))('should render', (objectType) => {
        const {baseElement} = render(
            <ArchiveConfirmationModal
                customFieldLabel="Foo"
                isOpen
                onConfirm={noop}
                onClose={noop}
                objectType={objectType}
            />
        )
        expect(baseElement).toMatchSnapshot()
    })
})
