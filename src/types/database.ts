export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'customer' | 'company' | 'admin'
          name: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'customer' | 'company' | 'admin'
          name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'customer' | 'company' | 'admin'
          name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          user_id: string
          business_name: string
          business_number: string | null
          service_regions: string[]
          move_types: string[]
          vehicles: Json
          status: 'pending' | 'active' | 'suspended'
          avg_rating: number
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          business_number?: string | null
          service_regions?: string[]
          move_types?: string[]
          vehicles?: Json
          status?: 'pending' | 'active' | 'suspended'
          avg_rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          business_number?: string | null
          service_regions?: string[]
          move_types?: string[]
          vehicles?: Json
          status?: 'pending' | 'active' | 'suspended'
          avg_rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      estimates: {
        Row: {
          id: string
          user_id: string | null
          phone: string | null
          schema_data: Json
          status: 'draft' | 'submitted' | 'matching' | 'matched' | 'completed' | 'cancelled'
          completion_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          phone?: string | null
          schema_data?: Json
          status?: 'draft' | 'submitted' | 'matching' | 'matched' | 'completed' | 'cancelled'
          completion_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          phone?: string | null
          schema_data?: Json
          status?: 'draft' | 'submitted' | 'matching' | 'matched' | 'completed' | 'cancelled'
          completion_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      matchings: {
        Row: {
          id: string
          estimate_id: string
          company_id: string
          status: 'pending' | 'accepted' | 'rejected' | 'timeout' | 'completed'
          match_score: number | null
          attempt_number: number
          expires_at: string | null
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          estimate_id: string
          company_id: string
          status?: 'pending' | 'accepted' | 'rejected' | 'timeout' | 'completed'
          match_score?: number | null
          attempt_number?: number
          expires_at?: string | null
          responded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          estimate_id?: string
          company_id?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'timeout' | 'completed'
          match_score?: number | null
          attempt_number?: number
          expires_at?: string | null
          responded_at?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          matching_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          matching_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          matching_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          estimate_id: string
          role: 'user' | 'system' | 'ai'
          content: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          estimate_id: string
          role: 'user' | 'system' | 'ai'
          content: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          estimate_id?: string
          role?: 'user' | 'system' | 'ai'
          content?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
