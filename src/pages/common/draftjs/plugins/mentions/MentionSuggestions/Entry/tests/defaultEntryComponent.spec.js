import {fromJS} from 'immutable'
import {shallow} from 'enzyme'

import defaultEntryComponent from '../defaultEntryComponent'


describe('defaultEntryComponent', () => {
    it('should render', () => {
        const component = shallow(
            defaultEntryComponent({
                mention: fromJS({
                    name: 'Marie Curie',
                    email: 'marïe@gorgias.io',
                    meta: {
                        profile_picture_url: 'https://gorgias.io/profilepicture.png'
                    }
                }),
                theme: {
                    mentionSuggestionsEntryText: 'my-class-name'
                }
            })
        )

        expect(component).toMatchSnapshot()
    })
})
