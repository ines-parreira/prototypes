import React from 'react'
import {render, waitFor} from '@testing-library/react'

import MacroEditLanguage from '../MacroEditLanguage'

// To avoid snapshoting all languages
jest.mock('constants/languages', () => {
    const module: Record<string, unknown> = jest.requireActual(
        'constants/languages'
    )
    return {
        ...module,
        ISO639English: {
            aa: 'Afar',
            ab: 'Abkhazian',
            af: 'Afrikaans',
        },
    }
})

jest.mock('models/language/resources', () => ({
    detectLanguage: jest.fn(() => Promise.resolve('af')),
}))

describe('<MacroEditLanguage />', () => {
    it('should render MacroEditLanguage', () => {
        const {container} = render(
            <MacroEditLanguage
                language={'aa'}
                setLanguage={jest.fn()}
                text={'hello world'}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should detect language when autodetect', async () => {
        jest.useFakeTimers()
        const setLanguage = jest.fn()
        render(
            <MacroEditLanguage
                language={''}
                setLanguage={setLanguage}
                text={'hello world'}
            />
        )
        await waitFor(() => expect(setLanguage).toHaveBeenCalledWith('af'))
    })
})
