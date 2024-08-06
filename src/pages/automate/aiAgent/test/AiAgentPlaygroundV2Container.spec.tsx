// import React from 'react'
// import {screen} from '@testing-library/react'
// import {renderWithRouter} from 'utils/testing'
// import {AiAgentPlaygroundContainerV2} from '../AiAgentPlaygroundV2Container'

jest.mock('hooks/useAppDispatch', () => () => jest.fn())

// const renderComponent = () => {
//     return renderWithRouter(<AiAgentPlaygroundContainerV2 />, {
//         path: `/:shopType/:shopName/ai-agent/playground`,
//         route: '/shopify/test-shop/ai-agent/playground',
//     })
// }

describe('<AiAgentPlaygroundV2Container />', () => {
    test.todo('should render')
})
