import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/playbook - Get all playbook setups
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: setups, error } = await supabase
      .from('playbook_setups')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching playbook:', error)
      return NextResponse.json({ error: 'Failed to fetch playbook' }, { status: 500 })
    }

    return NextResponse.json(setups)
  } catch (error) {
    console.error('Error in GET /api/playbook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/playbook - Create a new setup
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: setup, error } = await supabase
      .from('playbook_setups')
      .insert({
        user_id: user.id,
        name: body.name,
        description: body.description,
        rules: body.rules || [],
        screenshot_url: body.screenshot_url,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating setup:', error)
      return NextResponse.json({ error: 'Failed to create setup' }, { status: 500 })
    }

    return NextResponse.json(setup, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/playbook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
