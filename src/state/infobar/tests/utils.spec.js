import {actionButtonHashForData} from '../utils'

describe('actionButtonHashForData', () => {
    it('should hash payload', () => {
        const data = {
            action_name: 'foo',
            user_id: 4,
            integration_id: 8,
            payload: {
                a: 1.12,
                b: 2.78
            }
        }
        expect(actionButtonHashForData(data)).toMatchSnapshot()
    })

    it('should replace dots with underscores', () => {
        const data = {
            action_name: 'foo.bar',
            user_id: 4,
            integration_id: 8,
            payload: {
                a: 1.12,
                b: 2.78
            }
        }
        expect(actionButtonHashForData(data)).toMatchSnapshot()
    })
})
