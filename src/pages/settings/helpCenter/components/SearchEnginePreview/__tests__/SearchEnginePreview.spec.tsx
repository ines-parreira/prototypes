import React from 'react'
import {render} from '@testing-library/react'

import {SearchEnginePreview} from '../SearchEnginePreview'

describe('<SearchEnginePreview />', () => {
    it('matches snapshot', () => {
        const {container} = render(
            <SearchEnginePreview
                baseUrl={`https://acme.gorgias.rehab`}
                urlItems={[`free-article-1`]}
                title="Free article (EN)"
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur finibus condimentum dolor, fermentum ultrices ex tempus non. Nulla porttitor euismod luctus. Vestibulum in dictum nulla. Etiam eu urna arcu. Mauris pulvinar iaculis metus id sollicitudin. Proin auctor sapien sit amet mi rutrum porta. Duis varius et nulla id sodales."
            />
        )

        expect(container).toMatchSnapshot()
    })
})
