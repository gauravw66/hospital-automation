import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const htmlDir = path.join(process.cwd(), '..', 'html');
    if (!fs.existsSync(htmlDir)) {
      return NextResponse.json({ error: 'HTML templates directory not found' }, { status: 404 });
    }

    const files = fs.readdirSync(htmlDir);
    const htmlFiles = files.filter(file => file.endsWith('.html'));

    return NextResponse.json({ templates: htmlFiles });
  } catch (error) {
    console.error('Error listing templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
