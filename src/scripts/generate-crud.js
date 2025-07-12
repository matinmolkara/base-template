const fs = require("fs");
const path = require("path");

const modelName = process.argv[2];
const fields = process.argv.slice(3);

if (!modelName) {
  console.error("❌ Please provide a model name");
  console.log(
    "Usage: node scripts/generate-crud.js <ModelName> [field1:type] [field2:type]"
  );
  console.log(
    "Example: node scripts/generate-crud.js Post title:string content:text author_id:number"
  );
  process.exit(1);
}

console.log(`🚀 Generating CRUD for: ${modelName}`);

const modelNameLower = modelName.toLowerCase();
const modelNamePlural = modelNameLower + "s";

// تولید فایل‌های مختلف
generateModel(modelName, fields);
generateAPI(modelName, fields);
generateComponents(modelName, fields);
generatePages(modelName, fields);

console.log("✅ CRUD generation completed!");

function generateModel(name, fields) {
  const modelDir = path.join("src", "models");
  const modelFile = path.join(modelDir, `${name}.js`);

  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
  }

  const fieldsString = fields
    .map((field) => {
      const [fieldName, fieldType] = field.split(":");
      return `    ${fieldName}: ${getDefaultValue(fieldType)}`;
    })
    .join(",\n");

  const modelContent = `import { supabase } from '@/lib/supabase';

export class ${name}Model {
  constructor(data = {}) {
    this.id = data.id || null;
${fieldsString}
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  static async getAll() {
    const { data, error } = await supabase
      .from('${name.toLowerCase()}s')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(item => new ${name}Model(item));
  }

  static async getById(id) {
    const { data, error } = await supabase
      .from('${name.toLowerCase()}s')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return new ${name}Model(data);
  }

  async save() {
    const data = this.toObject();
    
    if (this.id) {
      // Update
      const { data: updated, error } = await supabase
        .from('${name.toLowerCase()}s')
        .update(data)
        .eq('id', this.id)
        .select()
        .single();
      
      if (error) throw error;
      return new ${name}Model(updated);
    } else {
      // Create
      const { data: created, error } = await supabase
        .from('${name.toLowerCase()}s')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return new ${name}Model(created);
    }
  }

  async delete() {
    if (!this.id) throw new Error('Cannot delete item without ID');
    
    const { error } = await supabase
      .from('${name.toLowerCase()}s')
      .delete()
      .eq('id', this.id);
    
    if (error) throw error;
    return true;
  }

  toObject() {
    const obj = { ...this };
    delete obj.id;
    delete obj.created_at;
    delete obj.updated_at;
    return obj;
  }
}`;

  fs.writeFileSync(modelFile, modelContent);
  console.log(`✅ Model created: ${modelFile}`);
}

function generateAPI(name, fields) {
  const apiDir = path.join("src", "app", "api", name.toLowerCase() + "s");
  const apiFile = path.join(apiDir, "route.js");
  const apiIdDir = path.join(apiDir, "[id]");
  const apiIdFile = path.join(apiIdDir, "route.js");

  // ایجاد فولدرها
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }
  if (!fs.existsSync(apiIdDir)) {
    fs.mkdirSync(apiIdDir, { recursive: true });
  }

  // API اصلی
  const apiContent = `import { NextResponse } from 'next/server';
import { ${name}Model } from '@/models/${name}';

export async function GET() {
  try {
    const items = await ${name}Model.getAll();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching ${name.toLowerCase()}s:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ${name.toLowerCase()}s' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const item = new ${name}Model(body);
    const savedItem = await item.save();
    
    return NextResponse.json(savedItem, { status: 201 });
  } catch (error) {
    console.error('Error creating ${name.toLowerCase()}:', error);
    return NextResponse.json(
      { error: 'Failed to create ${name.toLowerCase()}' },
      { status: 500 }
    );
  }
}`;

  // API با ID
  const apiIdContent = `import { NextResponse } from 'next/server';
import { ${name}Model } from '@/models/${name}';

export async function GET(request, { params }) {
  try {
    const item = await ${name}Model.getById(params.id);
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching ${name.toLowerCase()}:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ${name.toLowerCase()}' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const item = await ${name}Model.getById(params.id);
    
    // Update fields
    Object.keys(body).forEach(key => {
      if (body[key] !== undefined) {
        item[key] = body[key];
      }
    });
    
    const updatedItem = await item.save();
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating ${name.toLowerCase()}:', error);
    return NextResponse.json(
      { error: 'Failed to update ${name.toLowerCase()}' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const item = await ${name}Model.getById(params.id);
    await item.delete();
    
    return NextResponse.json({ message: '${name} deleted successfully' });
  } catch (error) {
    console.error('Error deleting ${name.toLowerCase()}:', error);
    return NextResponse.json(
      { error: 'Failed to delete ${name.toLowerCase()}' },
      { status: 500 }
    );
  }
}`;

  fs.writeFileSync(apiFile, apiContent);
  fs.writeFileSync(apiIdFile, apiIdContent);

  console.log(`✅ API routes created: ${apiFile}, ${apiIdFile}`);
}

function generateComponents(name, fields) {
  const componentsDir = path.join("src", "components", name);

  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  // List Component
  generateListComponent(name, fields, componentsDir);

  // Form Component
  generateFormComponent(name, fields, componentsDir);

  // Card Component
  generateCardComponent(name, fields, componentsDir);
}

function generateListComponent(name, fields, dir) {
  const listFile = path.join(dir, `${name}List.js`);

  const listContent = `'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import ${name}Card from './${name}Card';

export default function ${name}List() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/${name.toLowerCase()}s');
      if (!response.ok) throw new Error('Failed to fetch items');
      
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(\`/api/${name.toLowerCase()}s/\${id}\`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete item');
      
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>${name}s</h1>
            <Button href="/admin/${name.toLowerCase()}s/new" variant="primary">
              Add New ${name}
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      <Row>
        {items.length === 0 ? (
          <Col>
            <Alert variant="info">No ${name.toLowerCase()}s found.</Alert>
          </Col>
        ) : (
          items.map(item => (
            <Col key={item.id} md={6} lg={4} className="mb-4">
              <${name}Card 
                item={item} 
                onDelete={handleDelete}
              />
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}`;

  fs.writeFileSync(listFile, listContent);
}

function generateFormComponent(name, fields, dir) {
  const formFile = path.join(dir, `${name}Form.js`);

  const formFields = fields
    .map((field) => {
      const [fieldName, fieldType] = field.split(":");
      return `    ${fieldName}: ''`;
    })
    .join(",\n");

  const formInputs = fields
    .map((field) => {
      const [fieldName, fieldType] = field.split(":");
      const inputType = getInputType(fieldType);

      return `        <Input
          label="${fieldName.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}"
          type="${inputType}"
          name="${fieldName}"
          value={formData.${fieldName}}
          onChange={handleChange}
          error={errors.${fieldName}}
          required
        />`;
    })
    .join("\n        ");

  const formContent = `'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

export default function ${name}Form({ itemId = null }) {
  const [formData, setFormData] = useState({
${formFields}
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    if (itemId) {
      setIsEdit(true);
      fetchItem();
    }
  }, [itemId]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const response = await fetch(\`/api/${name.toLowerCase()}s/\${itemId}\`);
      if (!response.ok) throw new Error('Failed to fetch item');
      
      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
${fields
  .map((field) => {
    const [fieldName] = field.split(":");
    return `    if (!formData.${fieldName}) {
      newErrors.${fieldName} = '${fieldName.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} is required';
    }`;
  })
  .join("\n    ")}
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const url = isEdit ? \`/api/${name.toLowerCase()}s/\${itemId}\` : '/api/${name.toLowerCase()}s';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to save item');
      
      router.push('/admin/${name.toLowerCase()}s');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">
                {isEdit ? 'Edit' : 'Add'} ${name}
              </h2>
              
              {message && (
                <Alert variant="danger" className="mb-3">
                  {message}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
${formInputs}
                
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                    className="flex-grow-1"
                  >
                    {isEdit ? 'Update' : 'Create'} ${name}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push('/admin/${name.toLowerCase()}s')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}`;

  fs.writeFileSync(formFile, formContent);
}

function generateCardComponent(name, fields, dir) {
  const cardFile = path.join(dir, `${name}Card.js`);

  const cardFields = fields
    .slice(0, 3)
    .map((field) => {
      const [fieldName] = field.split(":");
      return `              <p className="card-text">
                <strong>${fieldName.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}:</strong> {item.${fieldName}}
              </p>`;
    })
    .join("\n");

  const cardContent = `import { Card, Button, ButtonGroup } from 'react-bootstrap';

export default function ${name}Card({ item, onDelete }) {
  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title>{item.${fields[0]?.split(":")[0] || "title"}}</Card.Title>
        <div className="flex-grow-1">
${cardFields}
        </div>
        
        <ButtonGroup className="mt-3">
          <Button
            variant="outline-primary"
            size="sm"
            href={\`/admin/${name.toLowerCase()}s/\${item.id}\`}
          >
            View
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            href={\`/admin/${name.toLowerCase()}s/\${item.id}/edit\`}
          >
            Edit
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onDelete(item.id)}
          >
            Delete
          </Button>
        </ButtonGroup>
      </Card.Body>
    </Card>
  );
}`;

  fs.writeFileSync(cardFile, cardContent);
}

function generatePages(name, fields) {
  const pagesDir = path.join("src", "app", "admin", name.toLowerCase() + "s");

  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
  }

  // List page
  const listPageFile = path.join(pagesDir, "page.js");
  const listPageContent = `import ${name}List from '@/components/${name}/${name}List';

export default function ${name}sPage() {
  return <${name}List />;
}`;

  fs.writeFileSync(listPageFile, listPageContent);

  // New page
  const newPageDir = path.join(pagesDir, "new");
  if (!fs.existsSync(newPageDir)) {
    fs.mkdirSync(newPageDir, { recursive: true });
  }

  const newPageFile = path.join(newPageDir, "page.js");
  const newPageContent = `import ${name}Form from '@/components/${name}/${name}Form';

export default function New${name}Page() {
  return <${name}Form />;
}`;

  fs.writeFileSync(newPageFile, newPageContent);

  // Edit page
  const editPageDir = path.join(pagesDir, "[id]", "edit");
  if (!fs.existsSync(editPageDir)) {
    fs.mkdirSync(editPageDir, { recursive: true });
  }

  const editPageFile = path.join(editPageDir, "page.js");
  const editPageContent = `import ${name}Form from '@/components/${name}/${name}Form';

export default function Edit${name}Page({ params }) {
  return <${name}Form itemId={params.id} />;
}`;

  fs.writeFileSync(editPageFile, editPageContent);
}

function getDefaultValue(type) {
  switch (type) {
    case "string":
    case "text":
      return `data.${type} || ''`;
    case "number":
      return `data.${type} || 0`;
    case "boolean":
      return `data.${type} || false`;
    default:
      return `data.${type} || ''`;
  }
}

function getInputType(type) {
  switch (type) {
    case "string":
      return "text";
    case "text":
      return "textarea";
    case "number":
      return "number";
    case "boolean":
      return "checkbox";
    case "email":
      return "email";
    case "password":
      return "password";
    default:
      return "text";
  }
}
