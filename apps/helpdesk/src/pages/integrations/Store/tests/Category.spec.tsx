import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Category as CategoryType } from 'models/integration/types/app'

import { Category } from '../Category'

const mockStore = configureMockStore([thunk])
const store = mockStore({})
describe('<Category />', () => {
    it('should render correctly', () => {
        const { container } = render(
            <Category category={CategoryType.QUALITY} />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render a "view all" arrow link', () => {
        render(<Category category={CategoryType.QUALITY} showCategoryLink />, {
            storeState: store.getState() as object,
        })
        expect(
            screen.getByText(/View All/).getAttribute('href'),
        ).toMatchInlineSnapshot(`"/?category=Quality%20Assurance"`)
    })
})
