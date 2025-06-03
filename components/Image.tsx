import NextImage, { ImageProps } from 'next/image'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH

const Image = ({ src, ...rest }: ImageProps) => (
  <NextImage src={`${basePath || ''}${src}`} {...rest} />
)

export default Image
