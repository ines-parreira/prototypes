import {renderInfobarTemplate} from '../infobar'

describe('renderInfobarTemplate()', () => {
    it('should render given template with icons', () => {
        const body = ':cart: Cart | {{nb_of_items}} items'
        const context = {nb_of_items: '4'}

        const result = renderInfobarTemplate(body, context)
        expect(result).toMatchSnapshot()
    })
})
