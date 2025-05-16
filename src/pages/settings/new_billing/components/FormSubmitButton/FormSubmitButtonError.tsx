import { useFormContext } from 'react-hook-form'

import Caption from 'pages/common/forms/Caption/Caption'

export const FormSubmitButtonError: React.FC = () => {
    const {
        formState: { errors },
    } = useFormContext()

    const addressError = errors?.address

    if (typeof addressError?.message === 'string') {
        return <Caption error={addressError.message} />
    }

    return null
}
