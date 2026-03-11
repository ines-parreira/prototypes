import { Controller, useFormContext } from 'react-hook-form'

import { Box } from '@gorgias/axiom'

import { ImageDropzone } from 'AIJourney/components/ImageDropzone/ImageDropzone'

export const ImageUpload = () => {
    const { control } = useFormContext()

    return (
        <Box flexDirection="column" gap="xxs">
            <Controller
                name="uploaded_image_attachment"
                control={control}
                render={({ field }) => (
                    <ImageDropzone
                        imageUrl={field.value?.[0]?.url}
                        onChange={field.onChange}
                    />
                )}
            />
        </Box>
    )
}
