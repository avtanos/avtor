import { Route, Routes } from 'react-router-dom'
import { HealthPage } from './pages/HealthPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { JournalsPage } from './pages/JournalsPage'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { ProfilePage } from './pages/ProfilePage'
import { JournalPublicPage } from './pages/JournalPublicPage'
import { CabinetHomePage } from './pages/Cabinet/CabinetHomePage'
import { AuthorCabinetPage } from './pages/Cabinet/AuthorCabinetPage'
import { ReviewerCabinetPage } from './pages/Cabinet/ReviewerCabinetPage'
import { EditorCabinetPage } from './pages/Cabinet/EditorCabinetPage'
import { PublishersPage } from './pages/PublishersPage'
import { ResearchersPage } from './pages/ResearchersPage'
import { SubjectsPage } from './pages/SubjectsPage'
import { MessagesPage } from './pages/Author/MessagesPage'
import { NotificationsPage } from './pages/Author/NotificationsPage'
import { SubmissionWizardPage } from './pages/Author/SubmissionWizardPage'
import { EditorDashboardPage } from './pages/Editor/EditorDashboardPage'
import { EditorArticlesPage } from './pages/Editor/EditorArticlesPage'
import { WorkflowPage } from './pages/Editor/WorkflowPage'
import { ReviewersPage } from './pages/Editor/ReviewersPage'
import { JournalUsersPage } from './pages/Editor/JournalUsersPage'
import { IssuesPage } from './pages/Editor/IssuesPage'
import { JournalPagesPage } from './pages/Editor/JournalPagesPage'
import { IndexesPage } from './pages/Editor/IndexesPage'
import { EmailTemplatesPage } from './pages/Editor/EmailTemplatesPage'
import { ImportExportPage } from './pages/Editor/ImportExportPage'
import { DoiPage } from './pages/Editor/DoiPage'
import { JournalSettingsPage } from './pages/Editor/JournalSettingsPage'
import { AdminPage } from './pages/AdminPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { useAuth } from './app/auth'
import { canAdmin, canAuthor, canEditor, canReviewer } from './app/rbac'
import { Navigate, Outlet } from 'react-router-dom'

function RequireAuth() {
  const { me } = useAuth()
  if (!me) return <Navigate to="/login" replace />
  return <Outlet />
}

function RequireRole({ allow }: { allow: (me: any) => boolean }) {
  const { me } = useAuth()
  if (!me) return <Navigate to="/login" replace />
  if (!allow(me)) return <Navigate to="/forbidden" replace />
  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/journals" element={<JournalsPage />} />
      <Route path="/publishers" element={<PublishersPage />} />
      <Route path="/researchers" element={<ResearchersPage />} />
      <Route path="/subjects" element={<SubjectsPage />} />
      <Route path="/j/:subdomain" element={<JournalPublicPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<RequireRole allow={canAuthor} />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/submit" element={<SubmissionWizardPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        <Route element={<RequireRole allow={canEditor} />}>
          <Route path="/editor/dashboard" element={<EditorDashboardPage />} />
          <Route path="/editor/articles" element={<EditorArticlesPage />} />
          <Route path="/editor/workflow" element={<WorkflowPage />} />
          <Route path="/editor/reviewers" element={<ReviewersPage />} />
          <Route path="/editor/users" element={<JournalUsersPage />} />
          <Route path="/editor/issues" element={<IssuesPage />} />
          <Route path="/editor/pages" element={<JournalPagesPage />} />
          <Route path="/editor/settings" element={<JournalSettingsPage />} />
          <Route path="/editor/indexes" element={<IndexesPage />} />
          <Route path="/editor/email-templates" element={<EmailTemplatesPage />} />
          <Route path="/editor/imports" element={<ImportExportPage />} />
          <Route path="/editor/doi" element={<DoiPage />} />
        </Route>

        <Route element={<RequireRole allow={canAdmin} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="/cabinet" element={<CabinetHomePage />}>
          <Route index element={<AuthorCabinetPage />} />
          <Route path="author" element={<AuthorCabinetPage />} />
          <Route element={<RequireRole allow={canReviewer} />}>
            <Route path="reviewer" element={<ReviewerCabinetPage />} />
          </Route>
          <Route element={<RequireRole allow={canEditor} />}>
            <Route path="editor" element={<EditorCabinetPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
