import type { ComponentProps, FC } from 'react'
import React from 'react'

import { FormFeedback } from 'reactstrap'

const Errors: FC<ComponentProps<typeof FormFeedback>> = ({
    children,
    ...rest
}) => <FormFeedback {...rest}>{children}</FormFeedback>

export default Errors
