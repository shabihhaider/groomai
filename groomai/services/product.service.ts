// services/product.service.ts
// Phase 7 — Product Ingredient Scanner service layer

import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/stores/user.store'

export interface FlaggedIngredient {
    name: string
    reason: string
    severity: 'mild' | 'moderate' | 'high'
}

export interface IngredientDetail {
    name: string
    function: string
    safetyScore: number
    isFlagged: boolean
    flagReason?: string
}

export interface ProductAnalysis {
    barcode?: string
    productName?: string
    brand?: string
    safetyScore: number
    verdict: 'safe' | 'caution' | 'avoid'
    flaggedIngredients: FlaggedIngredient[]
    goodIngredients: string[]
    summary: string
    ingredients: IngredientDetail[]
    remaining?: number
}

export interface ProductScan {
    id: string
    barcode: string | null
    product_name: string | null
    brand: string | null
    safety_score: number
    verdict: string
    analysis_result: ProductAnalysis
    scanned_at: string
}

export const productService = {
    /**
     * Step 1: Lookup product from Open Beauty Facts by barcode
     */
    async lookupBarcode(barcode: string): Promise<{
        productName: string
        brand: string
        category: string
        ingredientsRaw: string
        found: boolean
    }> {
        const res = await fetch(
            `https://world.openbeautyfacts.org/api/v0/product/${barcode}.json`
        )
        const json = await res.json()

        if (json.status === 0 || !json.product) {
            return { productName: '', brand: '', category: '', ingredientsRaw: '', found: false }
        }

        return {
            productName: json.product.product_name ?? '',
            brand: json.product.brands ?? '',
            category: json.product.categories ?? '',
            ingredientsRaw: json.product.ingredients_text ?? json.product.ingredients_text_en ?? '',
            found: true,
        }
    },

    /**
     * Step 2: Analyze ingredients via Edge Function (GPT-4o, personalized)
     */
    async analyzeIngredients(params: {
        barcode?: string
        productName: string
        brand: string
        category: string
        ingredientsRaw: string
    }): Promise<ProductAnalysis> {
        const store = useUserStore.getState()
        const userId = store.session?.user?.id
        const subscriptionStatus = store.profile?.subscription_status ?? 'free'
        const profile = store.profile

        if (!userId) throw new Error('Not authenticated')

        const { data, error } = await supabase.functions.invoke('analyze-product', {
            body: {
                userId,
                subscriptionStatus,
                ...params,
                userProfile: {
                    skinType: profile?.skin_type,
                    skinConcerns: profile?.skin_concerns,
                },
            },
        })

        if (error) throw error
        if (data?.error === 'rate_limit_exceeded') {
            throw Object.assign(new Error(data.message), { code: 'rate_limit_exceeded' })
        }
        return data as ProductAnalysis
    },

    async getScans(): Promise<ProductScan[]> {
        const userId = useUserStore.getState().session?.user?.id
        if (!userId) return []

        const { data, error } = await supabase
            .from('product_scans')
            .select('id, barcode, product_name, brand, safety_score, verdict, analysis_result, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) throw error
        return (data ?? []).map((row: any) => ({ ...row, scanned_at: row.created_at }))
    },
}
