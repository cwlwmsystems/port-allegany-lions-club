import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { completeTask } from './actions/task-actions';

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    priority?: string;
  }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  let query = supabase
    .from('tasks')
    .select(`
      id,
      title,
      description,
      due_date,
      priority,
      status,
      contacts (
        id,
        first_name,
        last_name
      ),
      organizations (
        id,
        name
      )
    `)
    .order('due_date', {
      ascending: true,
      nullsFirst: false,
    });

  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.priority) {
    query = query.eq(
      'priority',
      params.priority
    );
  }

  const { data: tasks, error } = await query;

  if (error) {
    return (
      <div className="crm-error">
        Unable to load tasks: {error.message}
      </div>
    );
  }

  const today =
    new Date().toISOString().slice(0, 10);

  return (
    <div>

      <div className="crm-page-header crm-page-header-row">

        <div>
          <h2 className="crm-page-title">
            Tasks
          </h2>

          <p className="crm-page-description">
            Manage follow-ups, commitments,
            and CRM next actions.
          </p>
        </div>

        <Link
          href="/club/tasks/new"
          className="crm-button"
        >
          + Add Task
        </Link>

      </div>


      <form
        method="get"
        className="crm-filter-bar"
      >

        <select
          name="status"
          defaultValue={params.status || ''}
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">
            In Progress
          </option>
          <option value="completed">
            Completed
          </option>
          <option value="cancelled">
            Cancelled
          </option>
        </select>

        <select
          name="priority"
          defaultValue={params.priority || ''}
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>

        <button
          type="submit"
          className="crm-button crm-button-secondary"
        >
          Filter
        </button>

        <Link
          href="/club/tasks"
          className="crm-filter-clear"
        >
          Clear
        </Link>

      </form>


      <div className="crm-table-card">

        <table className="crm-table">

          <thead>
            <tr>
              <th>Task</th>
              <th>Related To</th>
              <th>Due</th>
              <th>Priority</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            {tasks?.map((task: any) => {

              const contact =
                task.contacts as any;

              const organization =
                task.organizations as any;

              const overdue =
                task.due_date &&
                task.due_date < today &&
                !['completed', 'cancelled']
                  .includes(task.status);

              const completeAction =
                completeTask.bind(
                  null,
                  task.id
                );

              return (
                <tr
                  key={task.id}
                  className={
                    overdue
                      ? 'crm-task-overdue-row'
                      : ''
                  }
                >

                  <td>
                    <strong>
                      {task.title}
                    </strong>

                    {task.description && (
                      <div className="crm-table-subtext">
                        {task.description}
                      </div>
                    )}
                  </td>

                  <td>
                    {contact && (
                      <Link
                        href={`/club/contacts/${contact.id}`}
                        className="crm-link"
                      >
                        {contact.first_name}{' '}
                        {contact.last_name}
                      </Link>
                    )}

                    {contact && organization && (
                      <span> / </span>
                    )}

                    {organization && (
                      <Link
                        href={`/club/organizations/${organization.id}`}
                        className="crm-link"
                      >
                        {organization.name}
                      </Link>
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        overdue
                          ? 'crm-task-overdue'
                          : ''
                      }
                    >
                      {task.due_date || '—'}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`crm-priority crm-priority-${task.priority}`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td>
                    {task.status.replaceAll(
                      '_',
                      ' '
                    )}
                  </td>

                  <td>
                    <div className="crm-task-actions">

                      <Link
                        href={`/club/tasks/${task.id}/edit`}
                        className="crm-small-action"
                      >
                        Edit
                      </Link>

                      {!['completed', 'cancelled']
                        .includes(task.status) && (
                        <form
                          action={completeAction}
                        >
                          <button
                            type="submit"
                            className="crm-small-action crm-action-button"
                          >
                            Complete
                          </button>
                        </form>
                      )}

                    </div>
                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}
