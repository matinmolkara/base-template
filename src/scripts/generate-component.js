

const fs = require('fs');
const path = require('path');

const componentName = process.argv[2];
const componentType = process.argv[3] || 'component'; // component, page, api

if (!componentName) {
  console.error('❌ Please provide a component name');
  console.log('Usage: node scripts/generate-component.js <ComponentName> [type]');
  console.log('Types: component, page, api');
  process.exit(1);
}

console.log(`🚀 Generating ${componentType}: ${componentName}`);

switch (componentType) {
  case 'component':
    generateComponent(componentName);
    break;
  case 'page':
    generatePage(componentName);
    break;
  case 'api':
    generateAPI(componentName);
    break;
  default:
    console.error('❌ Invalid type. Use: component, page, or api');
    process.exit(1);
}

function generateComponent(name) {
  const componentDir = path.join('src', 'components', name);
  const componentFile = path.join(componentDir, `${name}.js`);
  const indexFile = path.join(componentDir, 'index.js');
  
  // ایجاد فولدر
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }
  
  // محتوای کامپوننت
  const componentContent = `import { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

export default function ${name}({ ...props }) {
  const [loading, setLoading] = useState(false);

  return (
    <Container>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>${name}</Card.Title>
              <Card.Text>
                This is the ${name} component.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}`;

  // محتوای index
  const indexContent = `export { default } from './${name}';`;
  
  // نوشتن فایل‌ها
  fs.writeFileSync(componentFile, componentContent);
  fs.writeFileSync(indexFile, indexContent);
  
  console.log(`✅ Component created: ${componentFile}`);
}

function generatePage(name) {
  const pagePath = path.join('src', 'app', name.toLowerCase(), 'page.js');
  const pageDir = path.dirname(pagePath);
  
  // ایجاد فولدر
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  
  // محتوای صفحه
  const pageContent = `import { Container, Row, Col } from 'react-bootstrap';

export default function ${name}Page() {
  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1>${name}</h1>
          <p>Welcome to the ${name} page.</p>
        </Col>
      </Row>
    </Container>
  );
}`;

  // نوشتن فایل
  fs.writeFileSync(pagePath, pageContent);
  
  console.log(`✅ Page created: ${pagePath}`);
}

function generateAPI(name) {
  const apiPath = path.join('src', 'app', 'api', name.toLowerCase(), 'route.js');
  const apiDir = path.dirname(apiPath);
  
  // ایجاد فولدر
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  
  // محتوای API
  const apiContent = `import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Your GET logic here
    return NextResponse.json({ message: 'GET ${name} successful' });
  } catch (error) {
    console.error('Error in GET ${name}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Your POST logic here
    return NextResponse.json({ message: 'POST ${name} successful', data: body });
  } catch (error) {
    console.error('Error in POST ${name}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Your PUT logic here
    return NextResponse.json({ message: 'PUT ${name} successful', data: body });
  } catch (error) {
    console.error('Error in PUT ${name}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Your DELETE logic here
    return NextResponse.json({ message: 'DELETE ${name} successful' });
  } catch (error) {
    console.error('Error in DELETE ${name}:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`;

  // نوشتن فایل
  fs.writeFileSync(apiPath, apiContent);
  
  console.log(`✅ API route created: ${apiPath}`);
}
