import {fromJS} from 'immutable'

import {renderFacebookCodeSnippet} from '../utils'

describe('facebook customer chat utils', () => {
    describe('renderFacebookCodeSnippet', () => {
        it('should render correctly', () => {
            const integration = fromJS({
                meta: {
                    page_id: 'mylittlepageid',
                },
            })

            expect(renderFacebookCodeSnippet(integration)).toMatchSnapshot()
        })
    })
})
