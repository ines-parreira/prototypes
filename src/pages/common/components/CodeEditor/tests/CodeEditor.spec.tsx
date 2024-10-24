import {render} from '@testing-library/react'
import React from 'react'

import CodeEditor from '../CodeEditor'

describe('<CodeEditor />', () => {
    it('should render the component', () => {
        const {container} = render(
            <CodeEditor title="Custom Code" tooltip="Hello there" />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})
