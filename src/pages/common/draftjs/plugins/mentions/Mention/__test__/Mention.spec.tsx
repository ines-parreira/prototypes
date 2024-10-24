import {render} from '@testing-library/react'
import {ContentState} from 'draft-js'
import React from 'react'

import Mention from '../index'

describe('Mention', () => {
    it('can render when mention is an Object', () => {
        const mention = {}
        const contentState = ContentState.createFromText('')
        const entityContentState = contentState.createEntity(
            'mention',
            'SEGMENTED',
            {mention}
        )
        const entityKey = entityContentState.getLastCreatedEntityKey()
        const {container} = render(
            <Mention
                contentState={contentState}
                entityKey={entityKey}
                theme={{}}
            />
        )

        expect(container.children.length).toEqual(1)
    })
})
