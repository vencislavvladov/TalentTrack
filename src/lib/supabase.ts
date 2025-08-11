import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          title: string
          department: string
          location: string
          type: 'full-time' | 'part-time' | 'contract' | 'remote'
          status: 'active' | 'paused' | 'closed'
          description: string
          requirements: string[]
          salary_min: number
          salary_max: number
          posted_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          department: string
          location: string
          type: 'full-time' | 'part-time' | 'contract' | 'remote'
          status: 'active' | 'paused' | 'closed'
          description: string
          requirements: string[]
          salary_min: number
          salary_max: number
          posted_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          department?: string
          location?: string
          type?: 'full-time' | 'part-time' | 'contract' | 'remote'
          status?: 'active' | 'paused' | 'closed'
          description?: string
          requirements?: string[]
          salary_min?: number
          salary_max?: number
          posted_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          location: string
          experience: number
          skills: string[]
          resume_url: string | null
          linkedin_url: string | null
          github_url: string | null
          join_date: string
          last_active: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          location: string
          experience: number
          skills: string[]
          resume_url?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          join_date?: string
          last_active?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          location?: string
          experience?: number
          skills?: string[]
          resume_url?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          join_date?: string
          last_active?: string
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          candidate_id: string
          status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired'
          stage: number
          applied_date: string
          last_updated: string
          resume_url: string | null
          cover_letter: string | null
          notes: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          candidate_id: string
          status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired'
          stage?: number
          applied_date?: string
          last_updated?: string
          resume_url?: string | null
          cover_letter?: string | null
          notes?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          candidate_id?: string
          status?: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired'
          stage?: number
          applied_date?: string
          last_updated?: string
          resume_url?: string | null
          cover_letter?: string | null
          notes?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'recruiter' | 'candidate'
          is_active: boolean
          created_at: string
          last_login: string | null
          avatar: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: 'admin' | 'recruiter' | 'candidate'
          is_active?: boolean
          created_at?: string
          last_login?: string | null
          avatar?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'recruiter' | 'candidate'
          is_active?: boolean
          created_at?: string
          last_login?: string | null
          avatar?: string | null
        }
      }
    }
  }
}