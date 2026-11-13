export interface Stall {
  id: number
  ownerId: number
  name: string
  category: string
  location: string | null
  description: string | null
  avgRating: number
  reviewCount: number
  isPopular: boolean
}

export interface StallPayload {
  name: string
  category: string
  location?: string
  description?: string
}

export interface ListMeta {
  page: number
  limit: number
  total: number
}

export interface StallList {
  items: Stall[]
  meta: ListMeta
}

export interface StallQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
}