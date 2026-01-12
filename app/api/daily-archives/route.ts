import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/daily-archives - Get daily archives
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase
      .from('daily_archives')
      .select('*')
      .eq('user_id', user.id)
      .order('archive_date', { ascending: false })

    if (date) {
      query = query.eq('archive_date', date)
    }
    if (startDate) {
      query = query.gte('archive_date', startDate)
    }
    if (endDate) {
      query = query.lte('archive_date', endDate)
    }

    const { data: archives, error } = await query

    if (error) {
      console.error('Error fetching archives:', error)
      return NextResponse.json({ error: 'Failed to fetch archives' }, { status: 500 })
    }

    return NextResponse.json(archives)
  } catch (error) {
    console.error('Error in GET /api/daily-archives:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/daily-archives - Create or update daily archive
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Upsert daily archive (update if exists for the same date)
    const { data: archive, error } = await supabase
      .from('daily_archives')
      .upsert({
        user_id: user.id,
        archive_date: body.archive_date,
        prep_data: body.prep_data,
        checklist_data: body.checklist_data,
        review_data: body.review_data,
        screenshots: body.screenshots,
      }, {
        onConflict: 'user_id,archive_date',
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving archive:', error)
      return NextResponse.json({ error: 'Failed to save archive' }, { status: 500 })
    }

    return NextResponse.json(archive)
  } catch (error) {
    console.error('Error in POST /api/daily-archives:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
