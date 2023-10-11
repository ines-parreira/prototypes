import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import DefaultEntryComponent from '../DefaultEntryComponent'

describe('DefaultEntryComponent', () => {
    it('should render', () => {
        const {container} = render(
            DefaultEntryComponent({
                mention: fromJS({
                    name: 'Marie Curie',
                    email: 'marie@gorgias.io',
                    meta: {
                        profile_picture_url:
                            'https://gorgias.io/profilepicture.png',
                    },
                }),
                theme: {
                    mentionSuggestionsEntryText: 'my-class-name',
                },
            })
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
