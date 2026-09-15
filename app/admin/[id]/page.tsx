import { notFound } from 'next/navigation';
import { isAdminAuthed } from '@/lib/admin-auth';
import { getSubmission, getSubmissionsByEmail, listSubmissions } from '@/lib/submissions';
import { listRejectionTemplates } from '@/lib/rejection-templates';
import LoginForm from '../login-form';
import ReviewDetail from './review-detail';
import '../../backend.css';

export default async function AdminSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authed = await isAdminAuthed();
  if (!authed) {
    return (
      <div className="bk">
        <div className="bk-wrap">
          <h1>Admin login</h1>
          <LoginForm />
        </div>
      </div>
    );
  }

  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();

  const [otherByEmail, all, templates] = await Promise.all([
    getSubmissionsByEmail(submission.email, submission.id),
    listSubmissions(),
    listRejectionTemplates(),
  ]);

  return (
    <div className="bk">
      <div className="bk-wrap bk-wide">
        <ReviewDetail
          initial={submission}
          otherByEmail={otherByEmail}
          allSubmissions={all}
          initialTemplates={templates}
        />
      </div>
    </div>
  );
}
