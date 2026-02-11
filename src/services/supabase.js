import { createClient } from '@supabase/supabase-js'

// Supabase Configuration - REPLACE WITH YOUR CREDENTIALS
const supabaseUrl = 'https://xdlinzawgxscbczvxyix.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkbGluemF3Z3hzY2JjenZ4eWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODQzNzksImV4cCI6MjA4NjE2MDM3OX0.vF7cXo7sdlYktpZ5m3gkWtkSxxje2akfhK1CucmIOkM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Field Services
export const fieldService = {
  async getAll() {
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .order('name')
    if (error) throw error
    return data
  },

  async create(field) {
    const { data, error } = await supabase
      .from('fields')
      .insert([field])
      .select()
    if (error) throw error
    return data[0]
  },

  async update(id, field) {
    const { data, error } = await supabase
      .from('fields')
      .update(field)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('fields')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

// Form Type Services
export const formTypeService = {
  async getAll() {
    const { data, error } = await supabase
      .from('form_types')
      .select(`
        *,
        form_fields(
          sort_order,
          fields(*)
        )
      `)
      .order('name')
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('form_types')
      .select(`
        *,
        form_fields(
          sort_order,
          fields(*)
        )
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(formType, fieldIds) {
    // Create form
    const { data: newForm, error: formError } = await supabase
      .from('form_types')
      .insert([{ name: formType.name, description: formType.description }])
      .select()
    
    if (formError) throw formError

    // Associate fields
    const formFields = fieldIds.map((fieldId, index) => ({
      form_type_id: newForm[0].id,
      field_id: fieldId,
      sort_order: index
    }))

    const { error: fieldsError } = await supabase
      .from('form_fields')
      .insert(formFields)
    
    if (fieldsError) throw fieldsError

    return newForm[0]
  },

  async update(id, formType, fieldIds) {
    // Update form
    const { error: formError } = await supabase
      .from('form_types')
      .update({ name: formType.name, description: formType.description })
      .eq('id', id)
    
    if (formError) throw formError

    // Delete previous fields
    await supabase
      .from('form_fields')
      .delete()
      .eq('form_type_id', id)

    // Associate new fields
    const formFields = fieldIds.map((fieldId, index) => ({
      form_type_id: id,
      field_id: fieldId,
      sort_order: index
    }))

    const { error: fieldsError } = await supabase
      .from('form_fields')
      .insert(formFields)
    
    if (fieldsError) throw fieldsError
  },

  async delete(id) {
    // First delete associated fields
    await supabase
      .from('form_fields')
      .delete()
      .eq('form_type_id', id)

    // Then delete form
    const { error } = await supabase
      .from('form_types')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Record Services
export const recordService = {
  async getAll(formTypeId = null) {
    let query = supabase
      .from('records')
      .select(`
        *,
        form_types(name)
      `)
      .order('created_at', { ascending: false })

    if (formTypeId) {
      query = query.eq('form_type_id', formTypeId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async create(record) {
    const { data, error } = await supabase
      .from('records')
      .insert([record])
      .select()
    if (error) throw error
    return data[0]
  },

  async update(id, record) {
    const { data, error } = await supabase
      .from('records')
      .update(record)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { error } = await supabase
      .from('records')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}

// Auth Services
export const authService = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) return null
    return session?.user ?? null
  }
}
