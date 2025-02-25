import { fromJS } from 'immutable'

import { CSM_CAMPAIGN_TEMPLATES } from '..'

describe('csmLibrary items', () => {
    it('should evaluate the configurations of the csm library without errors', async () => {
        const processed = Object.values(CSM_CAMPAIGN_TEMPLATES).map(
            async (item) => {
                return await item.getConfiguration(fromJS({}), fromJS({}))
            },
        )
        const output = await Promise.all(processed)
        output.forEach((item) => {
            expect(item).not.toBeUndefined()
        })
    })
})
