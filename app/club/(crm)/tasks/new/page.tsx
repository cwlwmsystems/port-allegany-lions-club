import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import TaskForm from '@/components/crm/task-form';
import { createTask } from '../actions/task-actions';

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{
    contact?: string;
    organization?: string;
  }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const [
    contactsResult,
    organizationsResult,
  ] = await Promise.all([

    supabase
      .from('contacts')
      .select(
        'id, first_name, last_name'
      )
      .order('last_name'),

    supabase
      .from('organizations')
      .select('id, name')
      .order('name'),

  ]);

  return (
    <div>

      <div className="crm-record-breadcrumb">

        <Link href="/club/tasks">
          Tasks
        </Link>

        <span>/</span>

        <span>
          New Task
        </span>

      </div>


      <div className="crm-page-header">

        <h2 className="crm-page-title">
          Add Task
        </h2>

        <p className="crm-page-description">
          Create a follow-up or next action.
        </p>

      </div>


      <TaskForm
        action={createTask}
        contacts={
          contactsResult.data ?? []
        }
        organizations={
          organizationsResult.data ?? []
        }
        task={{
          contact_id:
            params.contact || null,
          organization_id:
            params.organization || null,
        }}
        submitLabel="Create Task"
      />

    </div>
  );
}
