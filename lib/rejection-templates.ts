import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export type RejectionTemplate = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export type NewRejectionTemplate = Pick<RejectionTemplate, 'name' | 'message'>;

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'rejection-templates.json');

let writeQueue: Promise<unknown> = Promise.resolve();

async function readAll(): Promise<RejectionTemplate[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw) as RejectionTemplate[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

async function writeAll(templates: RejectionTemplate[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(templates, null, 2), 'utf8');
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(fn);
  writeQueue = result.catch(() => {});
  return result;
}

export function listRejectionTemplates(): Promise<RejectionTemplate[]> {
  return readAll().then((templates) => [...templates].sort((a, b) => a.name.localeCompare(b.name)));
}

export function createRejectionTemplate(input: NewRejectionTemplate): Promise<RejectionTemplate> {
  return enqueue(async () => {
    const templates = await readAll();
    const now = new Date().toISOString();
    const template: RejectionTemplate = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    templates.push(template);
    await writeAll(templates);
    return template;
  });
}

export function updateRejectionTemplate(
  id: string,
  patch: Partial<NewRejectionTemplate>
): Promise<RejectionTemplate | null> {
  return enqueue(async () => {
    const templates = await readAll();
    const index = templates.findIndex((t) => t.id === id);
    if (index === -1) return null;
    templates[index] = {
      ...templates[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await writeAll(templates);
    return templates[index];
  });
}

export function deleteRejectionTemplate(id: string): Promise<boolean> {
  return enqueue(async () => {
    const templates = await readAll();
    const next = templates.filter((t) => t.id !== id);
    if (next.length === templates.length) return false;
    await writeAll(next);
    return true;
  });
}
