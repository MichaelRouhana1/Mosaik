export interface Product {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string
  additionalImageUrls?: string
  category: string
  color?: string
  sizes?: string
}
