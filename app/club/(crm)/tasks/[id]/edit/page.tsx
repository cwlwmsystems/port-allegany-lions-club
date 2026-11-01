import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TaskForm from '@/components/crm/task-form';
import { updateTask } from '../../actions/task-actions';

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const [
    taskResult,
    contactsResult,
    organizationsResult,
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single(),

    supabase
      .from('contacts')
      .select('id, first_name, last_name')
      .order('last_name'),

    supabase
      .from('organizations')
      .select('id, name')
      .order('name'),
  ]);

  if (!taskResult.data) {
    notFound();
  }

  const updateAction =
    updateTask.bind(null, id);

  return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/tasks">
          Tasks
        </Link>

        <span>/</span>

        <span>Edit</span>
      </div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">
          Edit Task
        </h2>
      </div>

      <TaskForm
        action={updateAction}
        contacts={contactsResult.data ?? []}
        organizations={
          organizationsResult.data ?? []
        }
        task={taskResult.data}
        submitLabel="Save Task"
      />

    </div>
  );
}
