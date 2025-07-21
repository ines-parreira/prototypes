import { UpdateContactFormDto } from 'models/contactForm/types'
import {
    useCreateStoreMapping,
    useListStoreMappings,
} from 'models/storeMapping/queries'

interface ContactForm {
    id: number
    integration_id?: number | null
}

interface UsePreferencesStoreMappingProps {
    contactForm: ContactForm
}

export default function usePreferencesStoreMapping({
    contactForm,
}: UsePreferencesStoreMappingProps) {
    const { mutateAsync: createMapping } = useCreateStoreMapping()
    const { data: storeMappings } = useListStoreMappings(
        [contactForm.integration_id as number],
        {
            enabled: contactForm.integration_id != null,
            refetchOnWindowFocus: false,
        },
    )

    const handleStoreMappingCreation = async (
        updateContactFormDto: Pick<UpdateContactFormDto, 'shop_integration_id'>,
    ) => {
        if (
            (storeMappings == null || storeMappings.length <= 0) &&
            updateContactFormDto.shop_integration_id &&
            contactForm.integration_id != null
        ) {
            await createMapping([
                {
                    store_id: updateContactFormDto.shop_integration_id,
                    integration_id: contactForm.integration_id,
                },
            ])
        }
    }

    return {
        storeMappings,
        handleStoreMappingCreation,
    }
}
