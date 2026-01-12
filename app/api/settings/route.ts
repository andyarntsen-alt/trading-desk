import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/settings - Get user settings
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, trader_name')
      .eq('id', authUser.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }

    // Return default settings if none exist
    if (!settings) {
      return NextResponse.json({
        theme: { accent: 'emerald', mode: 'dark' },
        goals: null,
        daily_loss_limit: null,
        tilt_settings: null,
        widget_settings: null,
        prep_config: null,
        checklist_config: null,
        trader_name: user.trader_name,
      })
    }

    return NextResponse.json({
      ...settings,
      trader_name: user.trader_name,
    })
  } catch (error) {
    console.error('Error in GET /api/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Update trader name in users table if provided
    if (body.trader_name !== undefined) {
      await supabase
        .from('users')
        .update({ trader_name: body.trader_name })
        .eq('id', user.id)
    }

    // Upsert settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        theme: body.theme,
        goals: body.goals,
        daily_loss_limit: body.daily_loss_limit,
        tilt_settings: body.tilt_settings,
        widget_settings: body.widget_settings,
        prep_config: body.prep_config,
        checklist_config: body.checklist_config,
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error in PUT /api/settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
