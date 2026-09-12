import { isAdminAuthed } from '@/lib/admin-auth';
import { listSubmissions } from '@/lib/submissions';
import LoginForm from './login-form';
import ReviewBoard from './review-board';
import '../backend.css';

export default async function AdminPage() {
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

  const submissions = await listSubmissions();

  return (
    <div className="bk">
      <div className="bk-wrap bk-wide">
        <h1>Review submissions</h1>
        <ReviewBoard initial={submissions} />
      </div>
    </div>
  );
}
