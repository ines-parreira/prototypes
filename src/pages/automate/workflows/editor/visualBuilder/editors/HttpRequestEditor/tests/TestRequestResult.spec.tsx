import React from 'react'
import {render, screen} from '@testing-library/react'

import TestRequestResult from '../TestRequestResult'

describe('<TestRequestResult />', () => {
    it('should render variable using jsonpath filters', () => {
        render(
            <TestRequestResult
                nodeId=""
                result={{
                    status: 200,
                    content:
                        '{"strings":[{"name":"test","value":"filtered string"}]}',
                }}
                variables={[
                    {
                        id: 'filtered-string-id',
                        name: 'filtered-string',
                        jsonpath: "$.strings[?(@.name == 'test')].value",
                        data_type: 'string',
                    },
                    {
                        id: 'strings',
                        name: 'strings',
                        jsonpath: '$.strings',
                        data_type: 'json',
                    },
                ]}
                variablesInChildren={[]}
                onRetest={jest.fn()}
                onClose={jest.fn()}
                onChangeVariable={jest.fn()}
                onDeleteVariable={jest.fn()}
                onAddVariable={jest.fn()}
            />
        )

        expect(screen.getByDisplayValue('filtered string')).toBeInTheDocument()
        expect(
            screen.getByDisplayValue(
                '[{"name":"test","value":"filtered string"}]'
            )
        ).toBeInTheDocument()
    })
})
