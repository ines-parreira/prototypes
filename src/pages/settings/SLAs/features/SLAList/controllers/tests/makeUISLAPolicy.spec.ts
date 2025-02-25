import { slaPolicy1, UISLAPolicy1 } from 'pages/settings/SLAs/fixtures/fixtures'

import makeUISLAPolicy from '../makeUISLAPolicy'

describe('makeUISLAPolicy', () => {
    it('should transform provided polict', () => {
        expect(makeUISLAPolicy(slaPolicy1)).toEqual(UISLAPolicy1)
    })

    it('should use created_datetime if updated_datetime is not available', () => {
        const slaPolicyWithoutUpdatedDatetime = {
            ...slaPolicy1,
            updated_datetime: null,
        }

        expect(makeUISLAPolicy(slaPolicyWithoutUpdatedDatetime)).toEqual({
            ...UISLAPolicy1,
            updatedDatetime: slaPolicy1.created_datetime,
        })
    })
})
