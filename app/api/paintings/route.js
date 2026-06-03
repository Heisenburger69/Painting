import { NextResponse } from 'next/server';
import { getAll, create, getAllJSON, importJSON } from '@/lib/paintings';

export async function GET() {
  const paintings = await getAll();
  return NextResponse.json({ paintings });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const painting = await create(body);
    return NextResponse.json(painting, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const { action } = await request.json();
    if (action === 'import') {
      const { json } = await request.json();
      await importJSON(json);
      return NextResponse.json({ success: true });
    }
    if (action === 'reorder') {
      const { fromIndex, toIndex } = await request.json();
      const { reorder } = await import('@/lib/paintings');
      await reorder(fromIndex, toIndex);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
