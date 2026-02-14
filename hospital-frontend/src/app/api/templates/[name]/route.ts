import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    const htmlDir = path.join(process.cwd(), '..', 'html');
    const filePath = path.join(htmlDir, decodedName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf8');

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
